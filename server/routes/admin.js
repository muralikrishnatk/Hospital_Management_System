const express = require('express');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/accessControl');
const { User, Appointment, Billing, Inventory, Department, MedicalRecord, Prescription } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Sequelize } = require('sequelize');

const router = express.Router();

// All admin routes require admin role
router.use(auth, requireRole(['admin']));

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      totalBills,
      pendingBills,
      totalRevenue,
      lowStockItems
    ] = await Promise.all([
      User.count({ where: { role: 'patient', isActive: true } }),
      User.count({ where: { role: 'doctor', isActive: true } }),
      Appointment.count(),
      Appointment.count({ 
        where: { date: today } 
      }),
      Appointment.count({ where: { status: 'pending' } }),
      Billing.count(),
      Billing.count({ where: { status: 'pending' } }),
      Billing.sum('totalAmount', { where: { status: 'paid' } }),
      Inventory.count({ where: { quantity: { [Sequelize.Op.lte]: Sequelize.col('reorderLevel') } } })
    ]);

    // Recent appointments
    const recentAppointments = await Appointment.findAll({
      include: [
        { model: User, as: 'patient', attributes: ['firstName', 'lastName'] },
        { model: User, as: 'doctor', attributes: ['firstName', 'lastName', 'specialization'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          todayAppointments,
          pendingAppointments,
          totalBills,
          pendingBills,
          totalRevenue: totalRevenue || 0,
          lowStockItems
        },
        recentAppointments
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all users with filtering
// @route   GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    if (role) where.role = role;
    if (search) {
      where[Sequelize.Op.or] = [
        { firstName: { [Sequelize.Op.like]: `%${search}%` } },
        { lastName: { [Sequelize.Op.like]: `%${search}%` } },
        { email: { [Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / limit),
        results: users.length,
        totalResults: count
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new user
// @route   POST /api/admin/users
router.post('/users', async (req, res, next) => {
  try {
    const userData = req.body;
    
    // Validate role-specific required fields
    if (userData.role === 'doctor' && (!userData.specialization || !userData.licenseNumber)) {
      return next(new AppError('Doctors require specialization and license number', 400));
    }

    if (userData.role === 'pharmacist' && !userData.pharmacyLicense) {
      return next(new AppError('Pharmacists require pharmacy license number', 400));
    }

    const user = await User.create(userData);
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new AppError('User with this email or license number already exists', 400));
    }
    next(error);
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
router.put('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await user.update(userData);
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user (soft delete)
// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await user.update({ isActive: false });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all appointments
// @route   GET /api/admin/appointments
router.get('/appointments', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: [
        { model: User, as: 'patient', attributes: ['firstName', 'lastName', 'phone'] },
        { model: User, as: 'doctor', attributes: ['firstName', 'lastName', 'specialization'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC'], ['time', 'DESC']]
    });

    res.json({
      success: true,
      data: appointments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / limit),
        results: appointments.length,
        totalResults: count
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Manage inventory
// @route   GET /api/admin/inventory
router.get('/inventory', async (req, res, next) => {
  try {
    const { category, lowStock, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    if (category) where.category = category;
    if (lowStock === 'true') {
      where.quantity = { [Sequelize.Op.lte]: Sequelize.col('reorderLevel') };
    }

    const { count, rows: inventory } = await Inventory.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: inventory,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / limit),
        results: inventory.length,
        totalResults: count
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add inventory item
// @route   POST /api/admin/inventory
router.post('/inventory', async (req, res, next) => {
  try {
    const inventoryData = req.body;

    const inventoryItem = await Inventory.create(inventoryData);

    res.status(201).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get financial reports
// @route   GET /api/admin/reports/financial
router.get('/reports/financial', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = { status: 'paid' };
    if (startDate && endDate) {
      where.billDate = { [Sequelize.Op.between]: [startDate, endDate] };
    }

    const billingData = await Billing.findAll({
      where,
      include: [
        { model: User, as: 'patient', attributes: ['firstName', 'lastName'] }
      ],
      order: [['billDate', 'DESC']]
    });

    const totalRevenue = billingData.reduce((sum, bill) => sum + parseFloat(bill.totalAmount), 0);
    const totalPatients = [...new Set(billingData.map(bill => bill.patientId))].length;

    res.json({
      success: true,
      data: {
        billingData,
        summary: {
          totalRevenue,
          totalPatients,
          totalBills: billingData.length,
          averageBillAmount: totalRevenue / (billingData.length || 1)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get system statistics
// @route   GET /api/admin/statistics
router.get('/statistics', async (req, res, next) => {
  try {
    const [
      patientStats,
      doctorStats,
      appointmentStats,
      revenueStats
    ] = await Promise.all([
      // Patient statistics by month
      User.findAll({
        where: { role: 'patient' },
        attributes: [
          [Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'month'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['month'],
        raw: true
      }),

      // Doctor statistics
      User.findAll({
        where: { role: 'doctor' },
        attributes: [
          'specialization',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['specialization'],
        raw: true
      }),

      // Appointment statistics by status
      Appointment.findAll({
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      }),

      // Revenue statistics by month
      Billing.findAll({
        where: { status: 'paid' },
        attributes: [
          [Sequelize.fn('MONTH', Sequelize.col('billDate')), 'month'],
          [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue']
        ],
        group: ['month'],
        raw: true
      })
    ]);

    res.json({
      success: true,
      data: {
        patientStats,
        doctorStats,
        appointmentStats,
        revenueStats
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
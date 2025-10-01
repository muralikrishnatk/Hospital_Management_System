const express = require('express');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/accessControl');
const { User, Appointment, Billing } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// All receptionist routes require receptionist role
router.use(auth, requireRole(['receptionist']));

// @desc    Get receptionist dashboard
// @route   GET /api/receptionist/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      todayAppointments,
      pendingAppointments,
      walkInPatients,
      pendingPayments
    ] = await Promise.all([
      Appointment.count({ where: { date: today } }),
      Appointment.count({ where: { status: 'pending' } }),
      User.count({ 
        where: { 
          role: 'patient',
          createdAt: {
            [Sequelize.Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        } 
      }),
      Billing.count({ where: { status: 'pending' } })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          todayAppointments,
          pendingAppointments,
          walkInPatients,
          pendingPayments
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Schedule appointment
// @route   POST /api/receptionist/appointments
router.post('/appointments', async (req, res, next) => {
  try {
    const receptionistId = req.user.id;
    const appointmentData = {
      ...req.body,
      createdBy: receptionistId
    };

    const appointment = await Appointment.create(appointmentData);

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get appointments
// @route   GET /api/receptionist/appointments
router.get('/appointments', async (req, res, next) => {
  try {
    const { date, status } = req.query;

    const where = {};
    if (date) where.date = date;
    if (status) where.status = status;

    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: User, as: 'patient', attributes: ['firstName', 'lastName', 'phone'] },
        { model: User, as: 'doctor', attributes: ['firstName', 'lastName', 'specialization'] }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update appointment status
// @route   PUT /api/receptionist/appointments/:id
router.put('/appointments/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    await appointment.update({ status });

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Register new patient
// @route   POST /api/receptionist/patients
router.post('/patients', async (req, res, next) => {
  try {
    const patientData = {
      ...req.body,
      role: 'patient'
    };

    const patient = await User.create(patientData);
    const patientResponse = patient.toJSON();
    delete patientResponse.password;

    res.status(201).json({
      success: true,
      data: patientResponse
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get patients
// @route   GET /api/receptionist/patients
router.get('/patients', async (req, res, next) => {
  try {
    const { search } = req.query;

    const where = { role: 'patient', isActive: true };
    if (search) {
      where[Sequelize.Op.or] = [
        { firstName: { [Sequelize.Op.like]: `%${search}%` } },
        { lastName: { [Sequelize.Op.like]: `%${search}%` } },
        { phone: { [Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    const patients = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['firstName', 'ASC']]
    });

    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create bill
// @route   POST /api/receptionist/billing
router.post('/billing', async (req, res, next) => {
  try {
    const receptionistId = req.user.id;
    const { patientId, items, ...billData } = req.body;

    const billNumber = `BILL-${Date.now()}`;
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const totalAmount = subtotal - (billData.discount || 0);

    const bill = await Billing.create({
      ...billData,
      patientId,
      billNumber,
      items: JSON.stringify(items),
      subtotal,
      totalAmount,
      balance: totalAmount,
      createdBy: receptionistId
    });

    res.status(201).json({
      success: true,
      data: bill
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Collect payment
// @route   POST /api/receptionist/billing/:id/payment
router.post('/billing/:id/payment', async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;
    const { id } = req.params;

    const bill = await Billing.findByPk(id);
    if (!bill) {
      return next(new AppError('Bill not found', 404));
    }

    const newPaidAmount = parseFloat(bill.paidAmount) + parseFloat(amount);
    const newBalance = parseFloat(bill.totalAmount) - newPaidAmount;

    let status = bill.status;
    if (newBalance === 0) {
      status = 'paid';
    } else if (newPaidAmount > 0) {
      status = 'partial';
    }

    await bill.update({
      paidAmount: newPaidAmount,
      balance: newBalance,
      status,
      paymentMethod
    });

    res.json({
      success: true,
      message: 'Payment collected successfully',
      data: bill
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
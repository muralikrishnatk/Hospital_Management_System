const express = require('express');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/accessControl');
const { Billing, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// All billing routes require authentication
router.use(auth);

// @desc    Get all bills (admin only)
// @route   GET /api/billing
router.get('/', requireRole(['admin', 'receptionist']), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows: bills } = await Billing.findAndCountAll({
      where,
      include: [
        { model: User, as: 'patient', attributes: ['firstName', 'lastName', 'phone'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['billDate', 'DESC']]
    });

    // Parse items JSON
    const billsWithItems = bills.map(bill => {
      const billData = bill.toJSON();
      billData.items = JSON.parse(billData.items || '[]');
      return billData;
    });

    res.json({
      success: true,
      data: billsWithItems,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / limit),
        results: bills.length,
        totalResults: count
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get bill by ID
// @route   GET /api/billing/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const bill = await Billing.findByPk(id, {
      include: [
        { model: User, as: 'patient', attributes: ['firstName', 'lastName', 'phone', 'address'] }
      ]
    });

    if (!bill) {
      return next(new AppError('Bill not found', 404));
    }

    // Check permissions
    if (userRole === 'patient' && bill.patientId !== userId) {
      return next(new AppError('Access denied. You can only view your own bills.', 403));
    }

    // Parse items JSON
    const billData = bill.toJSON();
    billData.items = JSON.parse(billData.items || '[]');

    res.json({
      success: true,
      data: billData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
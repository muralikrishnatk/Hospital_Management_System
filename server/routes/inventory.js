const express = require('express');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/accessControl');
const { Inventory } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Sequelize } = require('sequelize');

const router = express.Router();

// All inventory routes require authentication
router.use(auth);

// @desc    Get inventory items
// @route   GET /api/inventory
router.get('/', requireRole(['admin', 'pharmacist']), async (req, res, next) => {
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

// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts
router.get('/alerts', requireRole(['admin', 'pharmacist']), async (req, res, next) => {
  try {
    const lowStockItems = await Inventory.findAll({
      where: { 
        quantity: { [Sequelize.Op.lte]: Sequelize.col('reorderLevel') },
        isActive: true
      },
      order: [['quantity', 'ASC']]
    });

    res.json({
      success: true,
      data: lowStockItems
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
router.put('/:id', requireRole(['admin', 'pharmacist']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const inventoryData = req.body;

    const inventoryItem = await Inventory.findByPk(id);
    if (!inventoryItem) {
      return next(new AppError('Inventory item not found', 404));
    }

    await inventoryItem.update(inventoryData);

    res.json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
const express = require('express');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/accessControl');
const { Prescription, Inventory, Billing, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Sequelize } = require('sequelize');

const router = express.Router();

// All pharmacist routes require pharmacist role
router.use(auth, requireRole(['pharmacist']));

// @desc    Get pharmacist dashboard
// @route   GET /api/pharmacist/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      pendingPrescriptions,
      dispensedToday,
      lowStockItems,
      totalInventory
    ] = await Promise.all([
      Prescription.count({ where: { status: 'active', isDispensed: false } }),
      Prescription.count({ 
        where: { 
          isDispensed: true,
          dispensedAt: {
            [Sequelize.Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        } 
      }),
      Inventory.count({ 
        where: { 
          quantity: { [Sequelize.Op.lte]: Sequelize.col('reorderLevel') },
          isActive: true
        } 
      }),
      Inventory.count({ where: { isActive: true } })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          pendingPrescriptions,
          dispensedToday,
          lowStockItems,
          totalInventory
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get pending prescriptions
// @route   GET /api/pharmacist/prescriptions/pending
router.get('/prescriptions/pending', async (req, res, next) => {
  try {
    const prescriptions = await Prescription.findAll({
      where: { 
        status: 'active', 
        isDispensed: false 
      },
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['firstName', 'lastName', 'phone']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['firstName', 'lastName', 'specialization']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Parse medications JSON
    const prescriptionsWithMedications = prescriptions.map(prescription => {
      const prescriptionData = prescription.toJSON();
      prescriptionData.medications = JSON.parse(prescriptionData.medications || '[]');
      return prescriptionData;
    });

    res.json({
      success: true,
      data: prescriptionsWithMedications
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Dispense prescription
// @route   POST /api/pharmacist/prescriptions/:id/dispense
router.post('/prescriptions/:id/dispense', async (req, res, next) => {
  try {
    const pharmacistId = req.user.id;
    const { id } = req.params;

    const prescription = await Prescription.findByPk(id);
    if (!prescription) {
      return next(new AppError('Prescription not found', 404));
    }

    if (prescription.isDispensed) {
      return next(new AppError('Prescription already dispensed', 400));
    }

    // Check inventory for all medications
    const medications = JSON.parse(prescription.medications);
    
    for (const med of medications) {
      const inventoryItem = await Inventory.findOne({
        where: { 
          name: { [Sequelize.Op.like]: `%${med.name}%` },
          isActive: true
        }
      });

      if (!inventoryItem) {
        return next(new AppError(`Medication ${med.name} not found in inventory`, 400));
      }

      if (inventoryItem.quantity < med.quantity) {
        return next(new AppError(`Insufficient stock for ${med.name}. Available: ${inventoryItem.quantity}`, 400));
      }

      // Update inventory
      await inventoryItem.update({
        quantity: inventoryItem.quantity - med.quantity
      });
    }

    // Update prescription
    await prescription.update({
      isDispensed: true,
      dispensedBy: pharmacistId,
      dispensedAt: new Date()
    });

    // Create pharmacy bill
    const billNumber = `PHARM-${Date.now()}`;
    const billItems = medications.map(med => ({
      name: med.name,
      quantity: med.quantity,
      unitPrice: med.unitPrice || 0,
      total: (med.unitPrice || 0) * med.quantity
    }));

    const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = subtotal;

    await Billing.create({
      patientId: prescription.patientId,
      billNumber,
      billDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: JSON.stringify(billItems),
      subtotal,
      totalAmount,
      status: 'pending',
      createdBy: pharmacistId
    });

    res.json({
      success: true,
      message: 'Prescription dispensed successfully',
      data: prescription
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get inventory
// @route   GET /api/pharmacist/inventory
router.get('/inventory', async (req, res, next) => {
  try {
    const { category = 'medicine', lowStock } = req.query;

    const where = { 
      category,
      isActive: true 
    };

    if (lowStock === 'true') {
      where.quantity = { [Sequelize.Op.lte]: Sequelize.col('reorderLevel') };
    }

    const inventory = await Inventory.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add inventory item
// @route   POST /api/pharmacist/inventory
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

// @desc    Update inventory item
// @route   PUT /api/pharmacist/inventory/:id
router.put('/inventory/:id', async (req, res, next) => {
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
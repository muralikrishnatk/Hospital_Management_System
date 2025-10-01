const express = require('express');
const { auth } = require('../middleware/auth');
const { requireRole, checkPatientOwnership } = require('../middleware/accessControl');
const { User, Appointment, MedicalRecord, Prescription, Billing } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// All patient routes require patient role
router.use(auth, requireRole(['patient']));

// @desc    Get patient dashboard
// @route   GET /api/patient/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [
      upcomingAppointments,
      totalAppointments,
      medicalRecords,
      pendingBills
    ] = await Promise.all([
      Appointment.findAll({
        where: { 
          patientId, 
          date: { [Sequelize.Op.gte]: today },
          status: { [Sequelize.Op.in]: ['confirmed', 'pending'] }
        },
        include: [
          { 
            model: User, 
            as: 'doctor', 
            attributes: ['firstName', 'lastName', 'specialization', 'phone'] 
          }
        ],
        order: [['date', 'ASC'], ['time', 'ASC']],
        limit: 5
      }),
      Appointment.count({ where: { patientId } }),
      MedicalRecord.count({ where: { patientId } }),
      Billing.count({ where: { patientId, status: 'pending' } })
    ]);

    res.json({
      success: true,
      data: {
        upcomingAppointments,
        stats: {
          totalAppointments,
          medicalRecords,
          pendingBills
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get patient appointments
// @route   GET /api/patient/appointments
router.get('/appointments', async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const { status } = req.query;

    const where = { patientId };
    if (status) where.status = status;

    const appointments = await Appointment.findAll({
      where,
      include: [
        { 
          model: User, 
          as: 'doctor', 
          attributes: ['firstName', 'lastName', 'specialization', 'phone'] 
        }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Book appointment
// @route   POST /api/patient/appointments
router.post('/appointments', async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const appointmentData = {
      ...req.body,
      patientId,
      createdBy: patientId,
      status: 'pending'
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

// @desc    Get medical records
// @route   GET /api/patient/medical-records
router.get('/medical-records', async (req, res, next) => {
  try {
    const patientId = req.user.id;

    const records = await MedicalRecord.findAll({
      where: { patientId },
      include: [
        { 
          model: User, 
          as: 'doctor', 
          attributes: ['firstName', 'lastName', 'specialization'] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get prescriptions
// @route   GET /api/patient/prescriptions
router.get('/prescriptions', async (req, res, next) => {
  try {
    const patientId = req.user.id;

    const prescriptions = await Prescription.findAll({
      where: { patientId },
      include: [
        { 
          model: User, 
          as: 'doctor', 
          attributes: ['firstName', 'lastName', 'specialization'] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Parse medications JSON
    const prescriptionsWithMeds = prescriptions.map(prescription => {
      const prescriptionData = prescription.toJSON();
      prescriptionData.medications = JSON.parse(prescriptionData.medications || '[]');
      return prescriptionData;
    });

    res.json({
      success: true,
      data: prescriptionsWithMeds
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get bills
// @route   GET /api/patient/bills
router.get('/bills', async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const { status } = req.query;

    const where = { patientId };
    if (status) where.status = status;

    const bills = await Billing.findAll({
      where,
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
      data: billsWithItems
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Make payment
// @route   POST /api/patient/bills/:id/payment
router.post('/bills/:id/payment', async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;
    const { amount, paymentMethod } = req.body;

    const bill = await Billing.findOne({
      where: { id, patientId }
    });

    if (!bill) {
      return next(new AppError('Bill not found', 404));
    }

    const newPaidAmount = parseFloat(bill.paidAmount) + parseFloat(amount);
    const newBalance = parseFloat(bill.totalAmount) - newPaidAmount;

    if (newBalance < 0) {
      return next(new AppError('Payment amount exceeds bill balance', 400));
    }

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
      message: 'Payment successful',
      data: bill
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get available doctors
// @route   GET /api/patient/doctors
router.get('/doctors', async (req, res, next) => {
  try {
    const { specialization } = req.query;

    const where = { 
      role: 'doctor', 
      isActive: true 
    };
    
    if (specialization) {
      where.specialization = specialization;
    }

    const doctors = await User.findAll({
      where,
      attributes: ['id', 'firstName', 'lastName', 'specialization', 'qualification', 'experience', 'consultationFee'],
      order: [['firstName', 'ASC']]
    });

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
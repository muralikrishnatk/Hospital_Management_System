const express = require('express');
const { auth } = require('../middleware/auth');
const { requireRole, checkDoctorPatientAccess } = require('../middleware/accessControl');
const { User, Appointment, MedicalRecord, Prescription } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Sequelize } = require('sequelize');

const router = express.Router();

// All doctor routes require doctor role
router.use(auth, requireRole(['doctor']));

// @desc    Get doctor dashboard
// @route   GET /api/doctor/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [
      todayAppointments,
      totalAppointments,
      completedAppointments,
      totalPatients,
      pendingPrescriptions
    ] = await Promise.all([
      Appointment.findAll({
        where: { 
          doctorId, 
          date: today,
          status: { [Sequelize.Op.in]: ['confirmed', 'pending'] }
        },
        include: [
          { model: User, as: 'patient', attributes: ['firstName', 'lastName', 'phone', 'bloodGroup'] }
        ],
        order: [['time', 'ASC']]
      }),
      Appointment.count({ where: { doctorId } }),
      Appointment.count({ where: { doctorId, status: 'completed' } }),
      Appointment.count({ 
        where: { doctorId },
        distinct: true,
        col: 'patientId'
      }),
      Prescription.count({ where: { doctorId, status: 'active' } })
    ]);

    res.json({
      success: true,
      data: {
        todayAppointments,
        stats: {
          totalAppointments,
          completedAppointments,
          todayAppointments: todayAppointments.length,
          totalPatients,
          pendingPrescriptions
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get doctor's patients
// @route   GET /api/doctor/patients
router.get('/patients', async (req, res, next) => {
  try {
    const doctorId = req.user.id;

    const patients = await Appointment.findAll({
      where: { doctorId },
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('patientId')), 'patientId']
      ],
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'firstName', 'lastName', 'phone', 'bloodGroup', 'dateOfBirth']
        }
      ],
      raw: true
    });

    // Get unique patients
    const uniquePatients = [];
    const patientIds = new Set();
    
    patients.forEach(apt => {
      if (apt.patient && !patientIds.has(apt.patient.id)) {
        patientIds.add(apt.patient.id);
        uniquePatients.push(apt.patient);
      }
    });

    res.json({
      success: true,
      data: uniquePatients
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get doctor's appointments
// @route   GET /api/doctor/appointments
router.get('/appointments', async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const { status, date } = req.query;

    const where = { doctorId };
    if (status) where.status = status;
    if (date) where.date = date;

    const appointments = await Appointment.findAll({
      where,
      include: [
        { 
          model: User, 
          as: 'patient', 
          attributes: ['firstName', 'lastName', 'phone', 'bloodGroup'] 
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

// @desc    Update appointment status
// @route   PUT /api/doctor/appointments/:id
router.put('/appointments/:id', async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const { id } = req.params;
    const { status, diagnosis, prescription, notes } = req.body;

    const appointment = await Appointment.findOne({
      where: { id, doctorId }
    });

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    await appointment.update({
      status,
      diagnosis,
      prescription,
      notes
    });

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create medical record
// @route   POST /api/doctor/medical-records
router.post('/medical-records', async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const { patientId, appointmentId, ...recordData } = req.body;

    // Verify doctor has access to this patient
    const appointment = await Appointment.findOne({
      where: { id: appointmentId, doctorId, patientId }
    });

    if (!appointment) {
      return next(new AppError('Access denied. Patient not under your care.', 403));
    }

    const medicalRecord = await MedicalRecord.create({
      ...recordData,
      patientId,
      doctorId,
      appointmentId
    });

    res.status(201).json({
      success: true,
      data: medicalRecord
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create prescription
// @route   POST /api/doctor/prescriptions
router.post('/prescriptions', async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const { patientId, appointmentId, medications, instructions, validUntil } = req.body;

    // Verify doctor has access to this patient
    const appointment = await Appointment.findOne({
      where: { id: appointmentId, doctorId, patientId }
    });

    if (!appointment) {
      return next(new AppError('Access denied. Patient not under your care.', 403));
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId,
      appointmentId,
      medications: JSON.stringify(medications),
      instructions,
      validUntil
    });

    res.status(201).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get patient medical history
// @route   GET /api/doctor/patients/:patientId/records
router.get('/patients/:patientId/records', checkDoctorPatientAccess, async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const records = await MedicalRecord.findAll({
      where: { patientId },
      include: [
        { model: User, as: 'doctor', attributes: ['firstName', 'lastName', 'specialization'] }
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

module.exports = router;
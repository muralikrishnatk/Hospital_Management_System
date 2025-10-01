const express = require('express');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/accessControl');
const { Appointment, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// All appointment routes require authentication
router.use(auth);

// @desc    Get available time slots for a doctor
// @route   GET /api/appointments/available-slots
router.get('/available-slots', async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return next(new AppError('Doctor ID and date are required', 400));
    }

    // Get existing appointments for the doctor on the given date
    const existingAppointments = await Appointment.findAll({
      where: {
        doctorId,
        date,
        status: { [Sequelize.Op.in]: ['confirmed', 'pending'] }
      },
      attributes: ['time']
    });

    const bookedSlots = existingAppointments.map(apt => apt.time);

    // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
    const availableSlots = [];
    const startTime = 9; // 9 AM
    const endTime = 17; // 5 PM

    for (let hour = startTime; hour < endTime; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        if (!bookedSlots.includes(timeString)) {
          availableSlots.push(timeString);
        }
      }
    }

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
router.put('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Check permissions
    if (userRole === 'patient' && appointment.patientId !== userId) {
      return next(new AppError('You can only cancel your own appointments', 403));
    }

    if (userRole === 'doctor' && appointment.doctorId !== userId) {
      return next(new AppError('You can only cancel your own appointments', 403));
    }

    await appointment.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
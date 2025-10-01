const { AppError } = require('./errorHandler');
const { Appointment } = require('../models');

// Strict role-based access control
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(`Access denied. ${req.user.role} role not authorized.`, 403));
    }

    next();
  };
};

// Ownership check for patient data
const checkPatientOwnership = (req, res, next) => {
  if (req.user.role === 'patient' && parseInt(req.params.patientId) !== req.user.id) {
    return next(new AppError('Access denied. You can only access your own data.', 403));
  }
  next();
};

// Doctor can only access their assigned patients
const checkDoctorPatientAccess = async (req, res, next) => {
  if (req.user.role === 'doctor') {
    const patientId = parseInt(req.params.patientId);
    
    // Check if doctor has any appointments with this patient
    const appointment = await Appointment.findOne({
      where: { doctorId: req.user.id, patientId }
    });

    if (!appointment) {
      return next(new AppError('Access denied. Patient not under your care.', 403));
    }
  }
  next();
};

// Pharmacist can only access prescription and inventory data
const checkPharmacistAccess = (req, res, next) => {
  if (req.user.role === 'pharmacist') {
    const allowedPaths = ['/prescriptions', '/inventory', '/billing/pharmacy'];
    const isAllowed = allowedPaths.some(path => req.path.includes(path));
    
    if (!isAllowed) {
      return next(new AppError('Pharmacist can only access prescription and inventory data.', 403));
    }
  }
  next();
};

// Receptionist access control
const checkReceptionistAccess = (req, res, next) => {
  if (req.user.role === 'receptionist') {
    const allowedPaths = ['/appointments', '/patients', '/billing'];
    const isAllowed = allowedPaths.some(path => req.path.includes(path));
    
    if (!isAllowed) {
      return next(new AppError('Receptionist can only manage appointments and patient registration.', 403));
    }
  }
  next();
};

module.exports = {
  requireRole,
  checkPatientOwnership,
  checkDoctorPatientAccess,
  checkPharmacistAccess,
  checkReceptionistAccess
};
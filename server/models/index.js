const { sequelize, Sequelize } = require('../config/database');

// Import models
const User = require('./User');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const Prescription = require('./Prescription');
const Inventory = require('./Inventory');
const Billing = require('./Billing');
const Department = require('./Department');

// Define associations
User.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

User.hasMany(MedicalRecord, { foreignKey: 'patientId', as: 'patientRecords' });
User.hasMany(MedicalRecord, { foreignKey: 'doctorId', as: 'doctorRecords' });
MedicalRecord.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
MedicalRecord.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

User.hasMany(Prescription, { foreignKey: 'patientId', as: 'patientPrescriptions' });
User.hasMany(Prescription, { foreignKey: 'doctorId', as: 'doctorPrescriptions' });
User.hasMany(Prescription, { foreignKey: 'dispensedBy', as: 'pharmacistDispensed' });
Prescription.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Prescription.belongsTo(User, { foreignKey: 'dispensedBy', as: 'pharmacist' });

User.hasMany(Billing, { foreignKey: 'patientId', as: 'patientBills' });
User.hasMany(Billing, { foreignKey: 'createdBy', as: 'createdBills' });
Billing.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Billing.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Appointment.hasOne(MedicalRecord, { foreignKey: 'appointmentId' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointmentId' });

Appointment.hasOne(Prescription, { foreignKey: 'appointmentId' });
Prescription.belongsTo(Appointment, { foreignKey: 'appointmentId' });

Appointment.hasOne(Billing, { foreignKey: 'appointmentId' });
Billing.belongsTo(Appointment, { foreignKey: 'appointmentId' });

Department.belongsTo(User, { foreignKey: 'headDoctorId', as: 'headDoctor' });
User.hasOne(Department, { foreignKey: 'headDoctorId', as: 'departmentHead' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Appointment,
  MedicalRecord,
  Prescription,
  Inventory,
  Billing,
  Department
};
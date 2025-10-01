const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Billing = sequelize.define('Billing', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  billNumber: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  billDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  items: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  paidAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  balance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'insurance', 'online', 'upi'),
    allowNull: true
  },
  insuranceProvider: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  insuranceClaimNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'billing'
});

module.exports = Billing;
const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Prescription = sequelize.define('Prescription', {
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
  doctorId: {
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
  medications: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active'
  },
  validUntil: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  isDispensed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dispensedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  dispensedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'prescriptions'
});

module.exports = Prescription;
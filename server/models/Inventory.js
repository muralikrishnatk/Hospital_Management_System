const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('medicine', 'equipment', 'supplies', 'lab'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  reorderLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  supplier: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  batchNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'inventory'
});

module.exports = Inventory;
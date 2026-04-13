const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Estimate = sequelize.define('Estimate', {
  estimated_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chain_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  group_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  brand_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  zone_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  service: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cost_per_unit: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  total_cost: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  delivery_details: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'estimates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'update_at'
});

module.exports = Estimate;
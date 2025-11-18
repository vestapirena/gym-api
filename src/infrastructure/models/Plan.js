// /src/infrastructure/models/Plan.js
/**
 * Modelo: Plan
 * Tabla: plans
 * Campos: id, name, description, price_net, tax_rate, price_gross, display_tax_included, price, max_users, max_clients, max_announcements
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize.config');

const Plan = sequelize.define('Plan', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:     { type: DataTypes.STRING(50), allowNull: false },
  description: { type: DataTypes.STRING(100), allowNull: false },
  price_net: { type: DataTypes.DECIMAL(10,4), allowNull: false },
  tax_rate:  { type: DataTypes.DECIMAL(5,4),  allowNull: false },   // 0.0000 – 9.9999
  price_gross: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  display_tax_included: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  price:     { type: DataTypes.FLOAT, allowNull: false },
  max_users: { type: DataTypes.INTEGER, allowNull: false },
  max_clients: { type: DataTypes.INTEGER, allowNull: false },
  max_announcements: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'plans',
  timestamps: true,
  underscored: true,
});

module.exports = Plan;

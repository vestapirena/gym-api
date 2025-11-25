// src/infrastructure/models/Membership.js
/**
 * Modelo: Membership
 * Tabla: memberships
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize.config');
const Gym = require('./Gym');

const Membership = sequelize.define('Membership', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  gym_id:      { type: DataTypes.INTEGER, allowNull: false },
  name:        { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: false },
  period_unit: { type: DataTypes.ENUM('day','month','year'), allowNull: false },
  period_value:{ type: DataTypes.INTEGER, allowNull: false },

  // ✅ FALTABA ESTE CAMPO
  personas:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },

  price_net:   { type: DataTypes.DECIMAL(10,4), allowNull: false },
  tax_rate:    { type: DataTypes.DECIMAL(5,4),  allowNull: false },
  display_tax_included: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  price_gross: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0.00 },
  price:       { type: DataTypes.FLOAT, allowNull: false },
  status:      { type: DataTypes.ENUM('Active','Inactive'), allowNull: false, defaultValue: 'Active' },
}, {
  tableName: 'memberships',
  timestamps: true,
  underscored: true,
});

Membership.belongsTo(Gym, { foreignKey: 'gym_id', as: 'gym' });
Gym.hasMany(Membership, { foreignKey: 'gym_id', as: 'memberships' });

module.exports = Membership;

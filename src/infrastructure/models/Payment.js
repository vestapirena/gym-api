// src/infrastructure/models/Payment.js
/**
 * Modelo: Payment
 * Tabla: payments
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize.config');
const Gym = require('./Gym');
const Membership = require('./Membership');

const Payment = sequelize.define('Payment', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  gym_id:        { type: DataTypes.INTEGER, allowNull: false },
  membership_id: { type: DataTypes.INTEGER, allowNull: false },

  amount_net:    { type: DataTypes.DECIMAL(10,4), allowNull: false },
  tax_rate:      { type: DataTypes.DECIMAL(5,4), allowNull: false },
  amount_gross:  { type: DataTypes.DECIMAL(10,2), allowNull: false },
  amount_paid:   { type: DataTypes.DECIMAL(10,2), allowNull: false },

  payment_method:{ type: DataTypes.ENUM('Cash','Card','Transfer','Other'), allowNull: false, defaultValue:'Cash' },
  paid_at:       { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  status:        { type: DataTypes.ENUM('Paid','Refunded','Cancelled'), allowNull: false, defaultValue:'Paid' },
  created_by:    { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
});

Payment.belongsTo(Gym,        { foreignKey:'gym_id',        as:'gym' });
Payment.belongsTo(Membership, { foreignKey:'membership_id', as:'membership' });

module.exports = Payment;

// src/infrastructure/models/ClientMembership.js
/**
 * Modelo: ClientMembership
 * Tabla: client_memberships
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize.config');
const Gym = require('./Gym');
const Client = require('./Client');
const Membership = require('./Membership');

const ClientMembership = sequelize.define('ClientMembership', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  gym_id:        { type: DataTypes.INTEGER, allowNull: false },
  client_id:     { type: DataTypes.INTEGER, allowNull: false },
  membership_id: { type: DataTypes.INTEGER, allowNull: false },
  payment_id:    { type: DataTypes.INTEGER, allowNull: false },

  start_date:    { type: DataTypes.DATE, allowNull: false },
  end_date:      { type: DataTypes.DATE, allowNull: false },
  status:        { type: DataTypes.ENUM('Active','Expired','Cancelled'), allowNull: false, defaultValue:'Active' },
}, {
  tableName: 'client_memberships',
  timestamps: true,
  underscored: true,
});

ClientMembership.belongsTo(Gym,        { foreignKey:'gym_id',        as:'gym' });
ClientMembership.belongsTo(Client,     { foreignKey:'client_id',     as:'client' });
ClientMembership.belongsTo(Membership, { foreignKey:'membership_id', as:'membership' });

module.exports = ClientMembership;

const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize.config');

const ClientSequence = sequelize.define('ClientSequence', {
  gym_id:     { type: DataTypes.INTEGER, primaryKey: true },
  last_value: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'client_sequences',
  timestamps: false,
  underscored: true,
});

module.exports = ClientSequence;

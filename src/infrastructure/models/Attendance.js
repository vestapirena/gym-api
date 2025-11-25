// src/infrastructure/models/Attendance.js
/**
 * Modelo: Attendance
 * Tabla: attendance
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize.config');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  gym_id: { type: DataTypes.INTEGER, allowNull: false },
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  client_membership_id: { type: DataTypes.INTEGER, allowNull: true },

  checked_in_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  was_allowed: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1 },
  reason: { type: DataTypes.STRING(120), allowNull: true },

  created_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'attendance',
  timestamps: true,
  underscored: true,
});

module.exports = Attendance;

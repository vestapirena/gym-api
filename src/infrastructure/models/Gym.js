// src/infrastructure/models/Gym.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize.config');

const Gym = sequelize.define('Gym', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
}, { tableName: 'gyms', timestamps: true, underscored: true });

module.exports = Gym;

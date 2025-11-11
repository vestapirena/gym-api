// src/infrastructure/models/Role.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize.config');

const Role = sequelize.define('Role', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'roles', timestamps: false });

module.exports = Role;

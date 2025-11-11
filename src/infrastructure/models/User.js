// src/infrastructure/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize.config');
const Role = require('./Role');
const Gym = require('./Gym');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  first_name: { type: DataTypes.STRING(100), allowNull: false },
  last_name:  { type: DataTypes.STRING(100), allowNull: false },
  email:      { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password:   { type: DataTypes.STRING(255), allowNull: false },
  phone:      { type: DataTypes.STRING(20) },
  role_id:    { type: DataTypes.INTEGER, allowNull: false },
  gym_id:     { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'users', timestamps: true, underscored: true });

// Asociaciones
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

User.belongsTo(Gym, { foreignKey: 'gym_id', as: 'gym' });
Gym.hasMany(User, { foreignKey: 'gym_id', as: 'users' });

module.exports = User;

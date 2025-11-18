// src/infrastructure/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize.config');
const Role = require('./Role');
const Gym  = require('./Gym');

const User = sequelize.define('User', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  first_name: { type: DataTypes.STRING(100), allowNull: false },
  last_name:  { type: DataTypes.STRING(100), allowNull: false },
  email:      { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password:   { type: DataTypes.STRING(255), allowNull: false },
  phone:      { type: DataTypes.STRING(20), allowNull: true },
  role_id:    { type: DataTypes.INTEGER, allowNull: false },
  gym_id:     { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'users',
  timestamps: true,        // habilita createdAt/updatedAt
  underscored: true,       // usa created_at / updated_at en DB
});

// Asociaciones (si ya las declaras en index.js, no dupliques)
User.belongsTo(Role, { as: 'role', foreignKey: 'role_id' });
User.belongsTo(Gym,  { as: 'gym',  foreignKey: 'gym_id'  });

module.exports = User;

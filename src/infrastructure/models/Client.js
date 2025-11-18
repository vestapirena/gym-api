/**
 * Modelo: Client
 * Tabla: clients
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize.config');

const Client = sequelize.define('Client', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  first_name: { type: DataTypes.STRING(50), allowNull: false },
  last_name:  { type: DataTypes.STRING(50), allowNull: false },
  email:      { type: DataTypes.STRING(80), allowNull: false, unique: true },
  phone:      { type: DataTypes.STRING(20), allowNull: true },
  birthdate:  { type: DataTypes.DATEONLY, allowNull: true },
  gender:     { type: DataTypes.ENUM('Male','Female','Other'), allowNull: true },
  status:     { type: DataTypes.ENUM('Active','Inactive'), allowNull: false, defaultValue: 'Active' },
  code:       { type: DataTypes.STRING(20), allowNull: false },
  gym_id:     { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'clients',
  timestamps: true,
  underscored: true,
  // Refleja la unicidad (gym_id, code) también en el ORM
  indexes: [
    { unique: true, fields: ['email'] },
    { unique: true, fields: ['gym_id', 'code'] },
  ],
});

module.exports = Client;

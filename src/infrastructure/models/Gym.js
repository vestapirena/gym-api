/**
 * Modelo: Gym
 * Tabla: gyms (id, plan_id, name, phone, created_at, updated_at)
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize.config');

const Gym = sequelize.define('Gym', {
  id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  plan_id: { type: DataTypes.INTEGER, allowNull: true },
  name:    { type: DataTypes.STRING(100), allowNull: false },
  phone:   { type: DataTypes.STRING(20), allowNull: true },
}, {
  tableName: 'gyms',
  timestamps: true,   // agrega createdAt/updatedAt en el modelo
  underscored: true,  // columnas físicas created_at/updated_at
});

module.exports = Gym;

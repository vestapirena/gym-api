// /src/infrastructure/models/index.js
/**
 * Registro único de modelos y asociaciones
 */
const User = require('./User');
const Role = require('./Role');
const Gym  = require('./Gym');
const Plan = require('./Plan');
const Client = require('./Client');

function applyAssociations() {
  if (!User.associations?.role)  User.belongsTo(Role, { as:'role', foreignKey:'role_id' });
  if (!User.associations?.gym)   User.belongsTo(Gym,  { as:'gym',  foreignKey:'gym_id' });
  if (!Gym.associations?.plan)   Gym.belongsTo(Plan,  { as:'plan', foreignKey:'plan_id' });
  if (!Client.associations?.gym) Client.belongsTo(Gym, { as:'gym',  foreignKey:'gym_id' });
}
applyAssociations();

module.exports = { User, Role, Gym, Plan, Client };

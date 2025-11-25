// src/infrastructure/models/index.js

const User = require('./User');
const Role = require('./Role');
const Gym  = require('./Gym');
const Plan = require('./Plan');
const Client = require('./Client');
const ClientSequence = require('./ClientSequence');
const Membership = require('./Membership');
const Payment = require('./Payment');
const ClientMembership = require('./ClientMembership');
const Attendance = require('./Attendance');

function applyAssociations() {
  // ====== las que ya tenías ======
  if (!User.associations?.role)
    User.belongsTo(Role, { as:'role', foreignKey:'role_id' });

  if (!User.associations?.gym)
    User.belongsTo(Gym,  { as:'gym', foreignKey:'gym_id' });

  if (!Gym.associations?.plan)
    Gym.belongsTo(Plan,  { as:'plan', foreignKey:'plan_id' });

  if (!Client.associations?.gym)
    Client.belongsTo(Gym, { as:'gym', foreignKey:'gym_id' });

  if (!Membership.associations?.gym)
    Membership.belongsTo(Gym, { as:'gym', foreignKey:'gym_id' });

  if (!Gym.associations?.memberships)
    Gym.hasMany(Membership, { as:'memberships', foreignKey:'gym_id' });

  // ====== wizard pagos ======
  if (!Payment.associations?.gym)
    Payment.belongsTo(Gym, { as:'gym', foreignKey:'gym_id' });

  if (!Payment.associations?.membership)
    Payment.belongsTo(Membership, { as:'membership', foreignKey:'membership_id' });

  if (!Payment.associations?.client_memberships)
    Payment.hasMany(ClientMembership, { as:'client_memberships', foreignKey:'payment_id' });

  if (!ClientMembership.associations?.payment)
    ClientMembership.belongsTo(Payment, { as:'payment', foreignKey:'payment_id' });

  if (!ClientMembership.associations?.client)
    ClientMembership.belongsTo(Client, { as:'client', foreignKey:'client_id' });

  if (!Client.associations?.client_memberships)
    Client.hasMany(ClientMembership, { as:'client_memberships', foreignKey:'client_id' });

  if (!Attendance.associations?.gym)
    Attendance.belongsTo(Gym, { as:'gym', foreignKey:'gym_id' });

  if (!Attendance.associations?.client)
    Attendance.belongsTo(Client, { as:'client', foreignKey:'client_id' });

  if (!Attendance.associations?.client_membership)
    Attendance.belongsTo(ClientMembership, { as:'client_membership', foreignKey:'client_membership_id' });

  if (!Attendance.associations?.created_by_user)
    Attendance.belongsTo(User, { as:'created_by_user', foreignKey:'created_by' });

  if (!Gym.associations?.attendance)
    Gym.hasMany(Attendance, { as:'attendance', foreignKey:'gym_id' });

  if (!Client.associations?.attendance)
    Client.hasMany(Attendance, { as:'attendance', foreignKey:'client_id' });

  if (!ClientMembership.associations?.attendance)
    ClientMembership.hasMany(Attendance, { as:'attendance', foreignKey:'client_membership_id' });

  if (!User.associations?.attendance_created)
    User.hasMany(Attendance, { as:'attendance_created', foreignKey:'created_by' });
}

applyAssociations();

module.exports = {
  User,
  Role,
  Gym,
  Plan,
  Client,
  ClientSequence,
  Membership,
  Payment,
  ClientMembership,
  Attendance,
};

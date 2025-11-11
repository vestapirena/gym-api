// src/domain/repositories/UserRepository.js
const { Op } = require('sequelize');
const User = require('../../infrastructure/models/User');
const Role = require('../../infrastructure/models/Role');
const Gym = require('../../infrastructure/models/Gym');

class UserRepository {
  static async findPaged({ page=1, limit=10, sortBy='created_at', order='DESC', q, roleId, gymId }) {
    const where = {};
    if (q) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${q}%` } },
        { last_name:  { [Op.like]: `%${q}%` } },
        { email:      { [Op.like]: `%${q}%` } },
        { phone:      { [Op.like]: `%${q}%` } },
      ];
    }
    if (roleId) where.role_id = roleId;
    if (gymId)  where.gym_id  = gymId;

    const offset = (page - 1) * limit;

    const { rows, count } = await User.findAndCountAll({
      where,
      include: [
        { model: Role, as: 'role', attributes: ['id','name'] },
        { model: Gym,  as: 'gym',  attributes: ['id','name'] },
      ],
      order: [[sortBy, order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));
    return { items: rows, meta: { page, limit, total: count, totalPages, sortBy, order } };
  }

  static async create(data) {
    const created = await User.create(data);
    return this.findById(created.id);
  }

  static async findById(id) {
    return User.findByPk(id, {
      include: [
        { model: Role, as: 'role', attributes: ['id','name'] },
        { model: Gym,  as: 'gym',  attributes: ['id','name'] },
      ],
    });
  }

  static async update(id, data) {
    await User.update(data, { where: { id } });
    return this.findById(id);
  }

  static async destroy(id) {
    return User.destroy({ where: { id } });
  }

  // Para login por email:
  static async findByEmail(email) {
    return User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role', attributes: ['id','name'] }],
    });
  }

  static async existsEmail(email) {
    const found = await User.findOne({ where: { email } });
    return !!found;
  }

  static async existsEmailExcludingId(email, excludeId) {
    const found = await User.findOne({
      where: {
        email,
        id: { [Op.ne]: excludeId }
      }
    });
    return !!found;
  }
}

module.exports = UserRepository;

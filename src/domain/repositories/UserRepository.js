// src/domain/repositories/UserRepository.js
const { Op } = require('sequelize');
const { User, Role, Gym } = require('../../infrastructure/models');

class UserRepository {
  static async findPaged({ page = 1, limit = 10, sortBy = 'created_at', order = 'DESC', q, roleId, gymId }) {
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
    const ord = (order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const sort = sortBy; // esperamos 'created_at' desde el front

    const { rows, count } = await User.findAndCountAll({
      where,
      include: [
        { model: Role, as: 'role', attributes: ['id','name'] },
        { model: Gym,  as: 'gym',  attributes: ['id','name'] },
      ],
      order: [[sort, ord], ['id', 'ASC']], // desempate estable
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));
    return { items: rows, meta: { page, limit, total: count, totalPages, sortBy: sort, order: ord } };
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
    const found = await User.findOne({ where: { email, id: { [Op.ne]: excludeId } } });
    return !!found;
  }

  // === Sticky helper: calcula en qué página cae un id con el orden actual ===
  static async getPageForId(id, { limit = 10, sortBy = 'created_at', order = 'DESC', q, roleId, gymId }) {
    const item = await User.findByPk(id, { attributes: ['id', 'created_at'] });
    if (!item) return 1;

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

    const s   = sortBy;                         // 'created_at'
    const ord = (order || 'DESC').toUpperCase();

    const opMain = ord === 'ASC' ? Op.lt : Op.gt;
    const countMain = await User.count({ where: { ...where, [s]: { [opMain]: item.get(s) } } });

    const opTie = ord === 'ASC' ? Op.lt : Op.gt;
    const countTie = await User.count({ where: { ...where, [s]: item.get(s), id: { [opTie]: item.id } } });

    const before = countMain + countTie;
    return Math.floor(before / limit) + 1;
  }
}

module.exports = UserRepository;

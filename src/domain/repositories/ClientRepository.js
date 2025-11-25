// src/domain/repositories/ClientRepository.js
const { Op } = require('sequelize');
const { Client, Gym } = require('../../infrastructure/models');

function buildWhere({ q, status, gymId }) {
  const where = {};
  if (q) {
    where[Op.or] = [
      { first_name: { [Op.like]: `%${q}%` } },
      { last_name:  { [Op.like]: `%${q}%` } },
      { email:      { [Op.like]: `%${q}%` } },
      { phone:      { [Op.like]: `%${q}%` } },
      { code:       { [Op.like]: `%${q}%` } },
    ];
  }
  if (status) where.status = status;
  if (gymId)  where.gym_id = gymId;
  return where;
}

function normalizeSort(sortBy = 'created_at') {
  return sortBy === 'created_at' ? 'createdAt' : sortBy;
}

class ClientRepository {
  static async findPaged({ page=1, limit=10, sortBy='created_at', order='DESC', q, status, gymId }) {
    const where = buildWhere({ q, status, gymId });
    const offset = (page - 1) * limit;
    const sort = normalizeSort(sortBy);
    const ord  = (order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { rows, count } = await Client.findAndCountAll({
      where,
      include: [{ model: Gym, as: 'gym', attributes: ['id','name'] }],
      order: [[sort, ord], ['id','ASC']],
      limit, offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));
    return { items: rows, meta: { page, limit, total: count, totalPages, sortBy, order } };
  }

  static async create(data, transaction = undefined) {
    const created = await Client.create(data, { transaction });
    if (transaction) return this.findById(created.id, transaction);
    return this.findById(created.id);
  }

  static async findById(id, transaction = undefined) {
    return Client.findByPk(id, {
      include: [{ model: Gym, as: 'gym', attributes: ['id','name'] }],
      transaction,
    });
  }

  static async update(id, data) {
    await Client.update(data, { where: { id } });
    return this.findById(id);
  }

  static async destroy(id) {
    return Client.destroy({ where: { id } });
  }

  static async getPageForId(id, { limit=10, sortBy='created_at', order='DESC', q, status, gymId }) {
    const s = normalizeSort(sortBy);
    const ord = (order || 'DESC').toUpperCase();

    const item = await Client.findByPk(id, { attributes: ['id', s] });
    if (!item) return 1;

    const whereBase = buildWhere({ q, status, gymId });

    const opMain = ord === 'ASC' ? Op.lt : Op.gt;
    const countMain = await Client.count({ where: { ...whereBase, [s]: { [opMain]: item.get(s) } } });

    const opTie = ord === 'ASC' ? Op.lt : Op.gt;
    const countTie = await Client.count({ where: { ...whereBase, [s]: item.get(s), id: { [opTie]: item.id } } });

    const before = countMain + countTie;
    return Math.floor(before / limit) + 1;
  }

  static async existsEmail(email) {
    const found = await Client.findOne({ where: { email } });
    return !!found;
  }

  static async existsEmailExcludingId(email, excludeId) {
    const found = await Client.findOne({ where: { email, id: { [Op.ne]: excludeId } } });
    return !!found;
  }

  // ✅ NUEVO: buscar cliente por gym + code
  static async findByGymAndCode(gymId, code) {
    return Client.findOne({
      where: { gym_id: gymId, code },
      include: [{ model: Gym, as:'gym', attributes:['id','name'] }],
    });
  }
}

module.exports = ClientRepository;

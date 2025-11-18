// /src/domain/repositories/ClientRepository.js
/**
 * Repositorio: Clients (CRUD + sticky)
 */
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

class ClientRepository {
  static async findPaged({ page=1, limit=10, sortBy='createdAt', order='DESC', q, status, gymId }) {
    const where = buildWhere({ q, status, gymId });
    const offset = (page - 1) * limit;

    // normaliza por si llega 'created_at' desde el front
    const sort = (sortBy === 'created_at' ? 'createdAt' : sortBy);
    const ord  = (order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { rows, count } = await Client.findAndCountAll({
      where,
      include: [{ model: Gym, as: 'gym', attributes: ['id','name'] }],
      order: [[sort, ord], ['id','ASC']],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));
    return { items: rows, meta: { page, limit, total: count, totalPages, sortBy: sort, order: ord } };
  }

  static async create(data, transaction = undefined) {
    const created = await Client.create(data, { transaction });
    return this.findById(created.id);
  }

  static async findById(id) {
    return Client.findByPk(id, {
      include: [{ model: Gym, as: 'gym', attributes: ['id','name'] }],
    });
  }

  static async update(id, data) {
    await Client.update(data, { where: { id } });
    return this.findById(id);
  }

  static async destroy(id) {
    return Client.destroy({ where: { id } });
  }

  static async getPageForId(id, { limit=10, sortBy='createdAt', order='DESC', q, status, gymId }) {
    const item = await Client.findByPk(id, {
      attributes: ['id','createdAt','first_name','last_name','email'],
    });
    if (!item) return 1;

    const whereBase = buildWhere({ q, status, gymId });
    const s   = (sortBy === 'created_at' ? 'createdAt' : sortBy);
    const ord = (order || 'DESC').toUpperCase();

    const opMain = ord === 'ASC' ? Op.lt : Op.gt;
    const countMain = await Client.count({
      where: { ...whereBase, [s]: { [opMain]: item.get(s) } },
    });

    const opTie = ord === 'ASC' ? Op.lt : Op.gt;
    const countTie = await Client.count({
      where: { ...whereBase, [s]: item.get(s), id: { [opTie]: item.id } },
    });

    const before = countMain + countTie;
    return Math.floor(before / limit) + 1;
  }

  static async existsEmail(email) {
    const found = await Client.findOne({ where: { email } });
    return !!found;
  }

  static async existsEmailExcludingId(email, excludeId) {
    const found = await Client.findOne({
      where: { email, id: { [Op.ne]: excludeId } },
    });
    return !!found;
  }
}

module.exports = ClientRepository;

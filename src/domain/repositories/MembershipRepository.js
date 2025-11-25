// src/domain/repositories/MembershipRepository.js

/**
 * Repositorio: Memberships (CRUD + sticky helpers)
 */
const { Op } = require('sequelize');
const { Membership, Gym } = require('../../infrastructure/models');

function buildWhere({ q, status, gymId }) {
  const where = {};
  if (q) {
    where[Op.or] = [
      { name:        { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
    ];
  }
  if (status) where.status = status;
  if (gymId)  where.gym_id = gymId;
  return where;
}

function normalizeSort(sortBy = 'created_at') {
  // FE manda created_at / updated_at ; Sequelize usa createdAt / updatedAt
  if (sortBy === 'created_at') return 'createdAt';
  if (sortBy === 'updated_at') return 'updatedAt';
  return sortBy;
}

class MembershipRepository {
  static async findPaged({ page=1, limit=10, sortBy='created_at', order='DESC', q, status, gymId }) {
    const where  = buildWhere({ q, status, gymId });
    const offset = (page - 1) * limit;

    const sort = normalizeSort(sortBy);
    const ord  = (order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { rows, count } = await Membership.findAndCountAll({
      where,
      include: [{ model: Gym, as: 'gym', attributes: ['id','name'] }],
      order: [[sort, ord], ['id','ASC']],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));
    return { items: rows, meta: { page, limit, total: count, totalPages, sortBy, order } };
  }

  static async create(data) {
    const created = await Membership.create(data);
    return this.findById(created.id);
  }

  static async findById(id) {
    return Membership.findByPk(id, {
      include: [{ model: Gym, as: 'gym', attributes: ['id','name'] }],
    });
  }

  static async update(id, data) {
    await Membership.update(data, { where: { id } });
    return this.findById(id);
  }

  static async destroy(id) {
    return Membership.destroy({ where: { id } });
  }

  /**
   * Página donde caería una membership según sort/order/q/limit
   * (con empate por id).
   */
  static async getPageForId(id, { limit=10, sortBy='created_at', order='DESC', q, status, gymId }) {
    const sort = normalizeSort(sortBy);

    const item = await Membership.findByPk(id, { attributes: ['id', sort] });
    if (!item) return 1;

    const whereBase = buildWhere({ q, status, gymId });
    const ord = (order || 'DESC').toUpperCase();

    const opMain = ord === 'ASC' ? Op.lt : Op.gt;
    const countMain = await Membership.count({
      where: { ...whereBase, [sort]: { [opMain]: item.get(sort) } }
    });

    const opTie = ord === 'ASC' ? Op.lt : Op.gt;
    const countTie = await Membership.count({
      where: { ...whereBase, [sort]: item.get(sort), id: { [opTie]: item.id } }
    });

    const before = countMain + countTie;
    return Math.floor(before / limit) + 1;
  }
}

module.exports = MembershipRepository;

// /src/domain/repositories/PlanRepository.js
/**
 * Repositorio: Planes (CRUD + sticky helpers)
 */
const { Op } = require('sequelize');
const { Plan } = require('../../infrastructure/models');

function buildWhere(q) {
  const where = {};
  if (q) {
    where[Op.or] = [
      { name:        { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
    ];
  }
  return where;
}

class PlanRepository {
  static async findPaged({ page=1, limit=10, sortBy='created_at', order='DESC', q }) {
    const where = buildWhere(q);
    const offset = (page - 1) * limit;

    const { rows, count } = await Plan.findAndCountAll({
      where,
      order: [[sortBy, order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'], ['id','ASC']],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));
    return { items: rows, meta: { page, limit, total: count, totalPages, sortBy, order } };
  }

  static async create(data) {
    const created = await Plan.create(data);
    return this.findById(created.id);
  }

  static async findById(id) {
    return Plan.findByPk(id);
  }

  static async update(id, data) {
    await Plan.update(data, { where: { id } });
    return this.findById(id);
  }

  static async destroy(id) {
    return Plan.destroy({ where: { id } });
  }

  // Sticky page calculator
  static async getPageForId(id, { limit=10, sortBy='created_at', order='DESC', q }) {
    const item = await Plan.findByPk(id, { attributes: ['id','name','created_at', 'description', 'price_net'] });
    if (!item) return 1;

    const whereBase = buildWhere(q);
    const opMain = order.toUpperCase() === 'ASC' ? Op.lt : Op.gt;
    const countMain = await Plan.count({ where: { ...whereBase, [sortBy]: { [opMain]: item.get(sortBy) } } });

    const opTie = order.toUpperCase() === 'ASC' ? Op.lt : Op.gt;
    const countTie = await Plan.count({ where: { ...whereBase, [sortBy]: item.get(sortBy), id: { [opTie]: item.id } } });

    const before = countMain + countTie;
    return Math.floor(before / limit) + 1;
  }

  // Para selects simples si llegas a necesitarlos
  static async findAllSimple() {
    return Plan.findAll({ attributes: ['id','name'], order: [['name','ASC']] });
  }

  static async existsById(id) {
    if (id == null) return false;
    const found = await Plan.findByPk(id, { attributes: ['id'] });
    return !!found;
  }
}

module.exports = PlanRepository;

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
// /src/domain/repositories/PlanRepository.js
static async getPageForId(id, { limit = 10, sortBy = 'created_at', order = 'DESC', q }) {
  // Traemos el registro completo, sin limitar atributos
  const item = await Plan.findByPk(id);
  if (!item) return 1;

  const whereBase = buildWhere(q);
  const ord = (order || 'DESC').toUpperCase();
  const col = sortBy || 'created_at';

  const opMain = ord === 'ASC' ? Op.lt : Op.gt;
  const countMain = await Plan.count({
    where: {
      ...whereBase,
      [col]: { [opMain]: item.get(col) },
    },
  });

  const opTie = ord === 'ASC' ? Op.lt : Op.gt;
  const countTie = await Plan.count({
    where: {
      ...whereBase,
      [col]: item.get(col),
      id: { [opTie]: item.id },
    },
  });

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

/**
 * Repositorio: Gyms (CRUD + sticky helpers)
 */
const { Op } = require('sequelize');
const { Gym, Plan } = require('../../infrastructure/models');

function buildWhere(q) {
  const where = {};
  if (q) {
    where[Op.or] = [
      { name:  { [Op.like]: `%${q}%` } },
      { phone: { [Op.like]: `%${q}%` } },
    ];
  }
  return where;
}

function normalizeSort(sortBy = 'created_at') {
  // FE manda created_at; Sequelize usa createdAt
  return sortBy === 'created_at' ? 'createdAt' : sortBy;
}

class GymRepository {
  static async findPaged({ page=1, limit=10, sortBy='created_at', order='DESC', q }) {
    const where = buildWhere(q);
    const offset = (page - 1) * limit;
    const sort = normalizeSort(sortBy);
    const ord  = (order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { rows, count } = await Gym.findAndCountAll({
      where,
      include: [{ model: Plan, as: 'plan', attributes: ['id','name'] }],
      order: [[sort, ord], ['id','ASC']],       // sort normalizado
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));
    return { items: rows, meta: { page, limit, total: count, totalPages, sortBy, order } };
  }

  static async create(data) {
    const created = await Gym.create(data);
    return this.findById(created.id);
  }

  static async findById(id) {
    return Gym.findByPk(id, { include: [{ model: Plan, as: 'plan', attributes: ['id','name'] }] });
  }

  static async update(id, data) {
    await Gym.update(data, { where: { id } });
    return this.findById(id);
  }

  static async destroy(id) {
    return Gym.destroy({ where: { id } });
  }

  static async existsById(id) {
    const found = await Gym.findByPk(id, { attributes: ['id'] });
    return !!found;
  }

  /**
   * Página donde caería un gym según sort/order/q/limit (con empate por id).
   */
  static async getPageForId(id, { limit=10, sortBy='created_at', order='DESC', q }) {
    const sort = normalizeSort(sortBy);
    const item = await Gym.findByPk(id, { attributes: ['id', sort] });
    if (!item) return 1;

    const whereBase = buildWhere(q);
    const ord = (order || 'DESC').toUpperCase();

    const opMain = ord === 'ASC' ? Op.lt : Op.gt;
    const countMain = await Gym.count({ where: { ...whereBase, [sort]: { [opMain]: item.get(sort) } } });

    const opTie = ord === 'ASC' ? Op.lt : Op.gt;
    const countTie = await Gym.count({ where: { ...whereBase, [sort]: item.get(sort), id: { [opTie]: item.id } } });

    const before = countMain + countTie;
    return Math.floor(before / limit) + 1;
  }

  // Selects simples
  static async findAllSimple() {
    return Gym.findAll({ attributes: ['id','name'], order: [['name','ASC']] });
  }
  static async findByIdSimple(id) {
    return Gym.findOne({ attributes: ['id','name'], where: { id } });
  }
}

module.exports = GymRepository;

// src/domain/repositories/PaymentRepository.js
const { Op } = require('sequelize');
const { Payment, Gym, Membership, ClientMembership, Client } = require('../../infrastructure/models');

function normalizeSort(sortBy='created_at') {
  if (sortBy === 'created_at') return 'createdAt';
  if (sortBy === 'updated_at') return 'updatedAt';
  return sortBy;
}

function buildWhere({ q, status, gymId }) {
  const where = {};
  if (status) where.status = status;
  if (gymId) where.gym_id = gymId;
  if (q) {
    const isNum = String(q).match(/^\d+$/);
    if (isNum) where.id = Number(q);
  }
  return where;
}

class PaymentRepository {
  static async findPaged({ page=1, limit=10, sortBy='created_at', order='DESC', q, status, gymId }) {
    const where = buildWhere({ q, status, gymId });
    const offset = (page - 1) * limit;
    const sort = normalizeSort(sortBy);
    const ord  = (order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { rows, count } = await Payment.findAndCountAll({
      where,
      include: [
        { model: Gym, as:'gym', attributes:['id','name'] },
        { model: Membership, as:'membership', attributes:['id','name','personas','period_unit','period_value'] },
        {
          model: ClientMembership,
          as: 'client_memberships',
          required: false,
          include: [{ model: Client, as:'client', attributes:['id','first_name','last_name','code'] }],
        },
      ],
      order: [[sort, ord], ['id','ASC']],
      limit, offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));
    return { items: rows, meta: { page, limit, total: count, totalPages, sortBy, order } };
  }

  // ✅ FIX: leer con la misma transacción
  static async create(data, transaction) {
    const created = await Payment.create(data, { transaction });
    return this.findById(created.id, transaction);
  }

  // ✅ FIX: findById acepta transaction opcional
  static async findById(id, transaction = undefined) {
    return Payment.findByPk(id, {
      include: [
        { model: Gym, as:'gym', attributes:['id','name'] },
        { model: Membership, as:'membership', attributes:['id','name','personas','period_unit','period_value'] },
      ],
      transaction,
    });
  }

  static async getPageForId(id, { limit=10, sortBy='created_at', order='DESC', q, status, gymId }) {
    const sort = normalizeSort(sortBy);
    const item = await Payment.findByPk(id, { attributes: ['id', sort] });
    if (!item) return 1;

    const whereBase = buildWhere({ q, status, gymId });
    const ord = (order || 'DESC').toUpperCase();

    const opMain = ord === 'ASC' ? Op.lt : Op.gt;
    const countMain = await Payment.count({
      where: { ...whereBase, [sort]: { [opMain]: item.get(sort) } }
    });

    const opTie = ord === 'ASC' ? Op.lt : Op.gt;
    const countTie = await Payment.count({
      where: { ...whereBase, [sort]: item.get(sort), id: { [opTie]: item.id } }
    });

    const before = countMain + countTie;
    return Math.floor(before / limit) + 1;
  }
}

module.exports = PaymentRepository;

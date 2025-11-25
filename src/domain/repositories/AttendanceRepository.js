const { Op } = require('sequelize');
const { Attendance, Gym, Client, ClientMembership, User } = require('../../infrastructure/models');

function buildWhere({ q, gymId, clientId, wasAllowed, from, to, date }) {
  const where = {};

  if (gymId)   where.gym_id = gymId;
  if (clientId) where.client_id = clientId;

  if (wasAllowed === 0 || wasAllowed === 1) {
    where.was_allowed = wasAllowed;
  }

  // ✅ Filtro por UNA fecha (date=YYYY-MM-DD)
  // Si viene "date" y NO vienen from/to, filtramos por TODO ese día.
  if (date && !from && !to) {
    const [year, month, day] = String(date).split('-').map(Number);
    if (year && month && day) {
      const start = new Date(year, month - 1, day, 0, 0, 0);
      const end   = new Date(year, month - 1, day + 1, 0, 0, 0); // día siguiente

      where.checked_in_at = {
        [Op.gte]: start,
        [Op.lt]:  end,
      };
    }
  } else if (from || to) {
    // ⬇️ Comportamiento viejo (rango libre from / to)
    where.checked_in_at = {};
    if (from) where.checked_in_at[Op.gte] = new Date(from);
    if (to)   where.checked_in_at[Op.lte] = new Date(to);
  }

  if (q) {
    where[Op.or] = [
      { reason:               { [Op.like]: `%${q}%` } },
      { '$client.code$':      { [Op.like]: `%${q}%` } },
      { '$client.first_name$':{ [Op.like]: `%${q}%` } },
      { '$client.last_name$': { [Op.like]: `%${q}%` } },
    ];
  }

  return where;
}

function normalizeSort(sortBy = 'created_at') {
  if (sortBy === 'created_at') return 'createdAt';
  if (sortBy === 'updated_at') return 'updatedAt';
  return sortBy;
}

class AttendanceRepository {
  static async findPaged({
    page = 1,
    limit = 10,
    sortBy = 'checked_in_at',
    order = 'DESC',
    q,
    gymId,
    clientId,
    wasAllowed,
    from,
    to,
    date,
  }) {
    const where  = buildWhere({ q, gymId, clientId, wasAllowed, from, to, date });
    const offset = (page - 1) * limit;
    const sort   = normalizeSort(sortBy);
    const ord    = (order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { rows, count } = await Attendance.findAndCountAll({
      where,
      include: [
        { model: Gym,              as: 'gym',               attributes: ['id', 'name'] },
        { model: Client,           as: 'client',            attributes: ['id', 'first_name', 'last_name', 'code', 'status'] },
        { model: ClientMembership, as: 'client_membership', attributes: ['id', 'start_date', 'end_date', 'status'] },
        { model: User,             as: 'created_by_user',   attributes: ['id', 'first_name', 'last_name', 'email'] },
      ],
      order: [[sort, ord], ['id', 'ASC']],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));
    return {
      items: rows,
      meta: { page, limit, total: count, totalPages, sortBy, order },
    };
  }

  static async create(data) {
    const created = await Attendance.create(data);
    return this.findById(created.id);
  }

  static async findById(id) {
    return Attendance.findByPk(id, {
      include: [
        { model: Gym,              as: 'gym',               attributes: ['id', 'name'] },
        { model: Client,           as: 'client',            attributes: ['id', 'first_name', 'last_name', 'code', 'status'] },
        { model: ClientMembership, as: 'client_membership', attributes: ['id', 'start_date', 'end_date', 'status'] },
        { model: User,             as: 'created_by_user',   attributes: ['id', 'first_name', 'last_name', 'email'] },
      ],
    });
  }

  static async getPageForId(
    id,
    {
      limit = 10,
      sortBy = 'checked_in_at',
      order = 'DESC',
      q,
      gymId,
      clientId,
      wasAllowed,
      from,
      to,
      date,
    }
  ) {
    const s   = normalizeSort(sortBy);
    const ord = (order || 'DESC').toUpperCase();

    const item = await Attendance.findByPk(id, { attributes: ['id', s] });
    if (!item) return 1;

    const whereBase = buildWhere({ q, gymId, clientId, wasAllowed, from, to, date });

    const opMain = ord === 'ASC' ? Op.lt : Op.gt;
    const countMain = await Attendance.count({
      where: { ...whereBase, [s]: { [opMain]: item.get(s) } },
    });

    const opTie = ord === 'ASC' ? Op.lt : Op.gt;
    const countTie = await Attendance.count({
      where: { ...whereBase, [s]: item.get(s), id: { [opTie]: item.id } },
    });

    const before = countMain + countTie;
    return Math.floor(before / limit) + 1;
  }
}

module.exports = AttendanceRepository;

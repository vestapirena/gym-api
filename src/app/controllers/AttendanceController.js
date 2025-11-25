/**
 * Controller: Attendance (check-in + sticky + lookup)
 */
const AttendanceService = require('../../domain/services/AttendanceService');

function qp(qs = {}) {
  const {
    page,
    limit,
    sortBy,
    order,
    q,
    gymId,
    clientId,
    wasAllowed,
    from,
    to,
    order_by,
    date,       // ✅ nueva fecha única opcional
  } = qs;

  return {
    page: Number(page) || 1,
    limit: Math.min(Number(limit) || 10, 100),
    sortBy: sortBy || order_by || 'checked_in_at',
    order: (order || 'DESC').toUpperCase(),
    q,
    gymId,
    clientId,
    wasAllowed: wasAllowed !== undefined ? Number(wasAllowed) : undefined,
    from,
    to,
    date,      // se pasa tal cual al service/repository
  };
}

class AttendanceController {
  static async list(req, res) {
    try {
      const data = await AttendanceService.list(qp(req.query), req.user);
      return res.json(data);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  static async checkIn(req, res) {
    try {
      const data = await AttendanceService.createAndReturnPage(
        req.body,
        qp(req.query),
        req.user
      );
      return res.status(201).json(data);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // ✅ lookup dentro de asistencia
  static async lookup(req, res) {
    try {
      console.log(
        '[LOOKUP] user=',
        req.user,
        'query.gym_id=',
        req.query.gym_id
      );

      const code = (req.params.code || '').trim();
      if (!code) {
        return res.status(400).json({ error: 'code requerido' });
      }

      const data = await AttendanceService.lookupByCode(
        code,
        req.user,
        req.query
      );
      return res.json(data);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

module.exports = AttendanceController;

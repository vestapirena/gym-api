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
    gym_id,   // 👈 soporta también gym_id
    clientId,
    wasAllowed,
    from,
    to,
    order_by,
    date,       // ✅ nueva fecha única opcional
  } = qs;

  // normalizamos gymId / gym_id
  const gymIdRaw = gymId != null ? gymId : gym_id;

  return {
    page: Number(page) || 1,
    limit: Math.min(Number(limit) || 10, 100),
    sortBy: sortBy || order_by || 'checked_in_at',
    order: (order || 'DESC').toUpperCase(),
    q,
    gymId: gymIdRaw ? Number(gymIdRaw) : undefined,
    clientId,
    wasAllowed:
      wasAllowed !== undefined && wasAllowed !== ''
        ? Number(wasAllowed)
        : undefined,
    from,
    to,
    date, // se pasa tal cual al service/repository
  };
}

class AttendanceController {
  static async list(req, res) {
    try {
      const params = qp(req.query);

      const includeRefs =
        req.query.includeRefs === '1' ||
        req.query.includeRefs === 'true' ||
        req.query.includeRefs === 'yes';

      const data = await AttendanceService.list(params, req.user, includeRefs);
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

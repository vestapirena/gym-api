// src/app/controllers/MembershipController.js
const MembershipService = require('../../domain/services/MembershipService');

function qp(qs = {}) {
  const {
    page, limit,
    order_by, sortBy,
    order, q, status,
    gym_id, gymId
  } = qs;

  return {
    page: Number(page) || 1,
    limit: Math.min(Number(limit) || 10, 100),
    sortBy: order_by || sortBy || 'created_at',
    order: (order || 'DESC').toUpperCase(),
    q, status,
    gymId: gym_id || gymId,
  };
}

function formatSequelizeError(e) {
  if (e && Array.isArray(e.errors)) {
    const details = e.errors.map(er => {
      let message = er.message;
      let path = er.path;

      // 👇 Caso específico: índice único de memberships (gym + name)
      if (er.type === 'unique violation' && er.path === 'uk_memberships_gym_name') {
        path = 'name';
        message = 'Ya existe una membresía con ese nombre en este gimnasio';
      }

      return {
        message,
        path,
        value: er.value,
        type: er.type,
      };
    });

    const first = details[0];

    return {
      error: 'Validación fallida',
      message: first?.message || 'Ocurrió un error de validación',
      field: first?.path || null,
      details,
    };
  }

  // Otros errores no controlados
  return {
    error: e?.message || 'Error inesperado',
  };
}


class MembershipController {
  static async list(req, res) {
    try {
      res.json(await MembershipService.list(qp(req.query), req.user));
    } catch (e) {
      res.status(400).json(formatSequelizeError(e));
    }
  }

  static async create(req, res) {
    try {
      res.status(201).json(
        await MembershipService.createAndReturnPage(req.body, qp(req.query), req.user)
      );
    } catch (e) {
      res.status(400).json(formatSequelizeError(e));
    }
  }

  static async update(req, res) {
    try {
      res.json(
        await MembershipService.updateAndReturnPage(
          Number(req.params.id),
          req.body,
          qp(req.query),
          req.user
        )
      );
    } catch (e) {
      res.status(400).json(formatSequelizeError(e));
    }
  }

  static async remove(req, res) {
    try {
      res.json(
        await MembershipService.removeAndReturnPage(
          Number(req.params.id),
          qp(req.query),
          req.user
        )
      );
    } catch (e) {
      res.status(400).json(formatSequelizeError(e));
    }
  }
}

module.exports = MembershipController;

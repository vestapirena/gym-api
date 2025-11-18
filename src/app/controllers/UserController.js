// src/app/controllers/UserController.js
const UserService = require('../../domain/services/UserService');

function qp(qs = {}) {
  const { page, limit, sortBy, order, q, roleId, gymId, includeRefs } = qs;
  return {
    page: Number(page) || 1,
    limit: Math.min(Number(limit) || 10, 100),
    sortBy: sortBy || 'created_at',                // esperamos created_at del front
    order: (order || 'DESC').toUpperCase(),
    q, roleId, gymId,
    includeRefs: includeRefs === '1' || includeRefs === 'true',
  };
}

class UserController {
  static async list(req, res) {
    try {
      const data = await UserService.list(qp(req.query), req.user);
      res.json(data);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  static async create(req, res) {
    try {
      const data = await UserService.createAndReturnPage(req.body, qp(req.query), req.user);
      res.status(201).json(data);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  static async update(req, res) {
    try {
      const data = await UserService.updateAndReturnPage(Number(req.params.id), req.body, qp(req.query), req.user);
      res.json(data);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  static async remove(req, res) {
    try {
      const data = await UserService.removeAndReturnPage(Number(req.params.id), qp(req.query), req.user);
      res.json(data);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
}

module.exports = UserController;

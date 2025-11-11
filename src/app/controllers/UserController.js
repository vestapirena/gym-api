// src/app/controllers/UserController.js
const UserService = require('../../domain/services/UserService');

class UserController {
  static async list(req, res) {
    try {
      const { page, limit, sortBy, order, q, roleId, gymId, includeRefs } = req.query;
      const data = await UserService.list({
        page: Number(page) || 1,
        limit: Math.min(Number(limit) || 10, 100),
        sortBy: sortBy || 'created_at',
        order: (order || 'DESC').toUpperCase(),
        q, roleId, gymId,
        includeRefs: includeRefs === '1' || includeRefs === 'true'
      }, req.user);
      res.json(data);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  static async create(req, res) {
    try {
      const created = await UserService.create(req.body, req.user);
      res.status(201).json(created);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  static async update(req, res) {
    try {
      const updated = await UserService.update(Number(req.params.id), req.body, req.user);
      res.json(updated);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  static async remove(req, res) {
    try {
      const { page, limit, sortBy, order, q, roleId, gymId } = req.query;
      const nextList = await UserService.removeAndReturnPage(Number(req.params.id), {
        page: Number(page) || 1,
        limit: Math.min(Number(limit) || 10, 100),
        sortBy: sortBy || 'created_at',
        order: (order || 'DESC').toUpperCase(),
        q, roleId, gymId
      }, req.user);
      res.json(nextList);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
}

module.exports = UserController;

// /src/app/controllers/ClientController.js
/**
 * Controller: Clientes (sticky responses)
 */
const ClientService = require('../../domain/services/ClientService');

function qp(qs = {}) {
  const { page, limit, sortBy, order, q, status, gymId, includeRefs } = qs;
  return {
    page: Number(page) || 1,
    limit: Math.min(Number(limit) || 10, 100),
    sortBy: sortBy || 'created_at',
    order: (order || 'DESC').toUpperCase(),
    q, status, gymId,
    includeRefs: includeRefs === '1' || includeRefs === 'true',
  };
}

class ClientController {
  static async list(req, res) {
    try { res.json(await ClientService.list(qp(req.query), req.user)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  static async getByCode(req, res) {
    try {
      // admin puede mandar ?gym_id=1 para desambiguar
      const gymId = req.query.gym_id ? Number(req.query.gym_id) : undefined;
      res.json(await ClientService.getByCode(req.params.code, gymId, req.user));
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
  static async create(req, res) {
    try { res.status(201).json(await ClientService.createAndReturnPage(req.body, qp(req.query), req.user)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  static async update(req, res) {
    try { res.json(await ClientService.updateAndReturnPage(Number(req.params.id), req.body, qp(req.query), req.user)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  static async remove(req, res) {
    try { res.json(await ClientService.removeAndReturnPage(Number(req.params.id), qp(req.query), req.user)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
}

module.exports = ClientController;

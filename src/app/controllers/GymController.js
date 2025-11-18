/**
 * Controller: Gimnasios (sticky list)
 */
const GymService = require('../../domain/services/GymService');

function qp(qs = {}) {
  const { page, limit, sortBy, order, q, includeRefs } = qs;
  return {
    page: Number(page) || 1,
    limit: Math.min(Number(limit) || 10, 100),
    sortBy: sortBy || 'created_at',                // FE manda created_at
    order: (order || 'DESC').toUpperCase(),
    q,
    includeRefs: includeRefs === '1' || includeRefs === 'true',
  };
}

class GymController {
  static async list(req, res) {
    try { res.json(await GymService.list(qp(req.query))); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  static async create(req, res) {
    try { res.status(201).json(await GymService.createAndReturnPage(req.body, qp(req.query))); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  static async update(req, res) {
    try {
      const data = await GymService.updateAndReturnPage(Number(req.params.id), req.body, qp(req.query));
      res.json(data);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  static async remove(req, res) {
    try { res.json(await GymService.removeAndReturnPage(Number(req.params.id), qp(req.query))); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
}

module.exports = GymController;

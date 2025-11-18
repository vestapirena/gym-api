// /src/app/controllers/PlanController.js
/**
 * Controller: Planes (sticky responses)
 */
const PlanService = require('../../domain/services/PlanService');

function getListParamsFromQuery(qs) {
  const { page, limit, sortBy, order, q } = qs || {};
  return {
    page: Number(page) || 1,
    limit: Math.min(Number(limit) || 10, 100),
    sortBy: sortBy || 'created_at',
    order: (order || 'DESC').toUpperCase(),
    q
  };
}

class PlanController {
  static async list(req, res) {
    try {
      const data = await PlanService.list(getListParamsFromQuery(req.query));
      res.json(data);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  static async create(req, res) {
    try {
      const data = await PlanService.createAndReturnPage(req.body, getListParamsFromQuery(req.query));
      res.status(201).json(data);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  static async update(req, res) {
    try {
      const data = await PlanService.updateAndReturnPage(
        Number(req.params.id), req.body, getListParamsFromQuery(req.query)
      );
      res.json(data);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  static async remove(req, res) {
    try {
      const data = await PlanService.removeAndReturnPage(
        Number(req.params.id), getListParamsFromQuery(req.query)
      );
      res.json(data);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
}

module.exports = PlanController;

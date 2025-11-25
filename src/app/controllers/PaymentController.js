// src/app/controllers/PaymentController.js
/**
 * Controller: Payments (wizard + sticky)
 */
const PaymentService = require('../../domain/services/PaymentService');

function qp(qs = {}) {
  const { page, limit, sortBy, order, q, status, gymId, order_by } = qs;
  return {
    page: Number(page) || 1,
    limit: Math.min(Number(limit) || 10, 100),
    sortBy: sortBy || order_by || 'created_at',   // acepta order_by también
    order: (order || 'DESC').toUpperCase(),
    q, status, gymId,
  };
}

class PaymentController {
  static async list(req, res) {
    try { res.json(await PaymentService.list(qp(req.query), req.user)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  static async create(req, res) {
    try {
      const data = await PaymentService.createAndReturnPage(req.body, qp(req.query), req.user);
      res.status(201).json(data);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
}

module.exports = PaymentController;

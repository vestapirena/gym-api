// src/app/routes/payments.routes.js
/**
 * Rutas: Payments (wizard)
 *   GET  /api/payments
 *   POST /api/payments
 * Permisos:
 *   - Admin: puede cobrar para cualquier gym (membership define gym)
 *   - Owner/Staff: solo para su gym
 */
const express = require('express');
const validateToken = require('../middlewares/validateToken');
const checkRole     = require('../middlewares/checkRole');
const validateBody  = require('../middlewares/validateBody');
const { createPaymentSchema } = require('../validators/payment.schema');
const PaymentController = require('../controllers/PaymentController');

const router = express.Router();

router.get('/',
  validateToken,
  checkRole('admin','Administrator','Gym Owner','Staff'),
  PaymentController.list
);

router.post('/',
  validateToken,
  checkRole('admin','Administrator','Gym Owner','Staff'),
  validateBody(createPaymentSchema),
  PaymentController.create
);

module.exports = router;

// src/app/routes/attendance.routes.js
/**
 * Rutas: Attendance
 */
const express = require('express');
const validateToken = require('../middlewares/validateToken');
const checkRole = require('../middlewares/checkRole');
const validateBody = require('../middlewares/validateBody');
const AttendanceController = require('../controllers/AttendanceController');
const { checkInSchema } = require('../validators/attendance.schema');

const router = express.Router();

// catálogo
router.get(
  '/',
  validateToken,
  checkRole('admin','Administrator','Gym Owner','Staff'),
  AttendanceController.list
);

// ✅ lookup por code dentro de asistencia
router.get(
  '/by-code/:code',
  validateToken,
  checkRole('admin','Administrator','Gym Owner','Staff'),
  AttendanceController.lookup
);

// check-in
router.post(
  '/check-in',
  validateToken,
  checkRole('admin','Administrator','Gym Owner','Staff'),
  validateBody(checkInSchema),
  AttendanceController.checkIn
);

module.exports = router;

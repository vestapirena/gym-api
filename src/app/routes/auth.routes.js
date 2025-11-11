// src/app/routes/auth.routes.js
const express = require('express');
const AuthController = require('../controllers/AuthController');
const validateToken = require('../middlewares/validateToken');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Login público
router.post('/login', AuthController.login);

// Ejemplo de ruta protegida (ping)
router.get('/me', validateToken, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// Ejemplo protegido por rol
router.get('/admin-only', validateToken, checkRole('admin'), (req, res) => {
  res.json({ ok: true, msg: 'Solo admin' });
});

module.exports = router;

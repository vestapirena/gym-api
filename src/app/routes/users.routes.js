// src/app/routes/users.routes.js
const express = require('express');
const validateToken = require('../middlewares/validateToken');
const checkRole = require('../middlewares/checkRole');
const validateBody = require('../middlewares/validateBody');
const ensureUniqueEmail = require('../middlewares/ensureUniqueEmail');
const enforceUpdatePolicy = require('../middlewares/enforceUpdatePolicy');
const { createUserSchema, updateUserSchema } = require('../validators/user.schema');
const UserController = require('../controllers/UserController');

const router = express.Router();

router.get(
  '/',
  validateToken,
  checkRole('admin', 'Administrator', 'Gym Owner'),
  UserController.list
);

router.post(
  '/',
  validateToken,
  checkRole('admin', 'Administrator', 'Gym Owner'),
  validateBody(createUserSchema),
  ensureUniqueEmail('create'),
  UserController.create
);

router.put(
  '/:id',
  validateToken,
  checkRole('admin', 'Administrator', 'Gym Owner'),
  enforceUpdatePolicy(),          // quita email, y password vacío
  validateBody(updateUserSchema),
  ensureUniqueEmail('update'),    // por si (contra políticas) llega email, valida unicidad
  UserController.update
);

router.delete(
  '/:id',
  validateToken,
  checkRole('admin', 'Administrator', 'Gym Owner'),
  UserController.remove
);

module.exports = router;

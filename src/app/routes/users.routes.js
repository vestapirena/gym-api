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

// Listar
router.get(
  '/',
  validateToken,
  checkRole('admin', 'Administrator', 'Gym Owner'),
  UserController.list
);

// Crear (Joi -> email único -> controller)
router.post(
  '/',
  validateToken,
  checkRole('admin', 'Administrator', 'Gym Owner'),
  validateBody(createUserSchema),
  ensureUniqueEmail('create'),
  UserController.create
);

// Actualizar
// Orden importante:
// 1) enforceUpdatePolicy: quita email y password vacía
// 2) Joi: valida lo que quedó
// 3) ensureUniqueEmail('update'): ya no corre si eliminamos email; si por alguna razón
//    llegara un email, igual checa unicidad consistentemente.
router.put(
  '/:id',
  validateToken,
  checkRole('admin', 'Administrator', 'Gym Owner'),
  enforceUpdatePolicy(),
  validateBody(updateUserSchema),
  ensureUniqueEmail('update'),
  UserController.update
);

// Eliminar
router.delete(
  '/:id',
  validateToken,
  checkRole('admin', 'Administrator', 'Gym Owner'),
  UserController.remove
);

module.exports = router;

// src/app/routes/clients.routes.js

/**
 * Rutas: Clientes
 *   GET    /api/clients
 *   GET    /api/clients/by-code/:code   ✅ NUEVO (buscar por código)
 *   GET    /api/clients/search
 *   POST   /api/clients
 *   PUT    /api/clients/:id
 *   DELETE /api/clients/:id
 */
const express = require('express');
const validateToken = require('../middlewares/validateToken');
const checkRole = require('../middlewares/checkRole');
const validateBody = require('../middlewares/validateBody');
const ensureUniqueEmailClient = require('../middlewares/ensureUniqueEmailClient');
const enforceClientUpdatePolicy = require('../middlewares/enforceClientUpdatePolicy');
const { createClientSchema, updateClientSchema } = require('../validators/client.schema');
const ClientController = require('../controllers/ClientController');

const router = express.Router();

router.get('/search',
  validateToken,
  checkRole('admin','Administrator','Gym Owner','Staff'),
  ClientController.search
);

router.get('/by-code/:code',
  validateToken,
  checkRole('admin','Administrator','Gym Owner','Staff'),
  ClientController.getByCode
);

router.get('/',
  validateToken,
  checkRole('admin','Administrator','Gym Owner'),
  ClientController.list
);

router.post('/',
  validateToken,
  checkRole('admin','Administrator','Gym Owner'),
  validateBody(createClientSchema),
  ensureUniqueEmailClient('create'),
  ClientController.create
);

router.put('/:id',
  validateToken,
  checkRole('admin','Administrator','Gym Owner'),
  enforceClientUpdatePolicy(),
  validateBody(updateClientSchema),
  ClientController.update
);

router.delete('/:id',
  validateToken,
  checkRole('admin','Administrator','Gym Owner'),
  ClientController.remove
);

module.exports = router;

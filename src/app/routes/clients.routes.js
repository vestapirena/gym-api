// /src/app/routes/clients.routes.js
/**
 * Rutas: Clientes
 *   GET    /api/clients            (admin: todos; owner: su gym)
 *   POST   /api/clients            (admin: cualquier gym; owner: su gym)
 *   PUT    /api/clients/:id        (admin puede cambiar gym; owner no)
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

router.get('/',    validateToken, checkRole('admin','Administrator','Gym Owner'), ClientController.list);

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
  // (email se removió; no hace falta checar unicidad en update)
  ClientController.update
);

router.delete('/:id',
  validateToken,
  checkRole('admin','Administrator','Gym Owner'),
  ClientController.remove
);

module.exports = router;

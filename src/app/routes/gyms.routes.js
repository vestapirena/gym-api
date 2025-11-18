/**
 * Rutas: Gimnasios (solo Admin)
 */
const express = require('express');
const validateToken = require('../middlewares/validateToken');
const checkRole = require('../middlewares/checkRole');
const validateBody = require('../middlewares/validateBody');
const { createGymSchema, updateGymSchema } = require('../validators/gym.schema');
const GymController = require('../controllers/GymController');

const router = express.Router();

router.get('/',     validateToken, checkRole('admin','Administrator'), GymController.list);
router.post('/',    validateToken, checkRole('admin','Administrator'), validateBody(createGymSchema), GymController.create);
router.put('/:id',  validateToken, checkRole('admin','Administrator'), validateBody(updateGymSchema), GymController.update);
router.delete('/:id', validateToken, checkRole('admin','Administrator'), GymController.remove);

module.exports = router;

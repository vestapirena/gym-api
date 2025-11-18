// /src/app/routes/plans.routes.js
/**
 * Rutas: Planes (solo Admin)
 *   GET    /api/plans
 *   POST   /api/plans
 *   PUT    /api/plans/:id
 *   DELETE /api/plans/:id
 */
const express = require('express');
const validateToken = require('../middlewares/validateToken');
const checkRole = require('../middlewares/checkRole');
const validateBody = require('../middlewares/validateBody');
const { createPlanSchema, updatePlanSchema } = require('../validators/plan.schema');
const PlanController = require('../controllers/PlanController');

const router = express.Router();

router.get('/', validateToken, checkRole('admin','Administrator'), PlanController.list);
router.post('/', validateToken, checkRole('admin','Administrator'), validateBody(createPlanSchema), PlanController.create);
router.put('/:id', validateToken, checkRole('admin','Administrator'), validateBody(updatePlanSchema), PlanController.update);
router.delete('/:id', validateToken, checkRole('admin','Administrator'), PlanController.remove);

module.exports = router;

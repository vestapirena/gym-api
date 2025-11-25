/**
 * Rutas: Memberships
 *   GET    /api/memberships
 *   POST   /api/memberships
 *   PUT    /api/memberships/:id
 *   DELETE /api/memberships/:id
 * Permisos:
 *   - Admin: todo (cualquier gym)
 *   - Owner: solo su gym (en service se fuerza/valida)
 */
const express = require('express');
const validateToken = require('../middlewares/validateToken');
const checkRole     = require('../middlewares/checkRole');
const validateBody  = require('../middlewares/validateBody');
const { createMembershipSchema, updateMembershipSchema } = require('../validators/membership.schema');
const MembershipController = require('../controllers/MembershipController');

const router = express.Router();

router.get('/',    validateToken, checkRole('admin','Administrator','Gym Owner'), MembershipController.list);
router.post('/',   validateToken, checkRole('admin','Administrator','Gym Owner'), validateBody(createMembershipSchema), MembershipController.create);
router.put('/:id', validateToken, checkRole('admin','Administrator','Gym Owner'), validateBody(updateMembershipSchema), MembershipController.update);
router.delete('/:id', validateToken, checkRole('admin','Administrator','Gym Owner'), MembershipController.remove);

module.exports = router;

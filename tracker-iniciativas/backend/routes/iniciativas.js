const express = require('express');
const router = express.Router();
const controller = require('../controllers/iniciativasController');

/**
 * GET /api/iniciativas/proximos-vencimientos
 * Optional query param: ?days=7
 * Must be declared BEFORE /:id to avoid being matched as a param route.
 */
router.get('/proximos-vencimientos', controller.getProximosVencimientos);

/**
 * GET /api/iniciativas
 * Optional query params: ?estado= ?prioridad=
 */
router.get('/', controller.getAll);

/**
 * POST /api/iniciativas
 * Body: { nombre, responsable, estado, fecha_limite, prioridad, descripcion }
 */
router.post('/', controller.create);

/**
 * PATCH /api/iniciativas/:id
 * Body: partial iniciativa fields to update
 */
router.patch('/:id', controller.update);

module.exports = router;

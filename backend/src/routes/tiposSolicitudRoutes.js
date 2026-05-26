const { Router } = require('express');
const controller = require('../controllers/requestsController');

const router = Router();

/**
 * @openapi
 * /tipos-solicitud:
 *   get:
 *     summary: Obtener tipos de solicitud
 *     description: Retorna la lista de tipos de solicitud disponibles.
 *     tags:
 *       - Tipos de Solicitud
 *     responses:
 *       200:
 *         description: Lista de tipos de solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TipoSolicitud'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', controller.getTiposSolicitud);

module.exports = router;
const { Router } = require('express');
const controller = require('../controllers/requestsController');

const router = Router();

/**
 * @openapi
 * /areas:
 *   get:
 *     summary: Obtener todas las áreas
 *     description: Retorna la lista de áreas disponibles para usar en el formulario de solicitudes.
 *     tags:
 *       - Áreas
 *     responses:
 *       200:
 *         description: Lista de áreas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Area'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', controller.getAreas);

module.exports = router;

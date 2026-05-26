const { Router } = require('express');
const controller = require('../controllers/requestsController');

const router = Router();

/**
 * @openapi
 * /requests:
 *   get:
 *     summary: Obtener solicitudes
 *     description: >
 *       Retorna la lista de solicitudes con joins a tipos_solicitud y areas.
 *       Usar el parámetro `status=pendientes` para filtrar sólo las que están
 *       en estado "Recibida" o "En revisión".
 *     tags:
 *       - Solicitudes
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendientes]
 *         required: false
 *         description: Filtrar por solicitudes pendientes (Recibida o En revisión)
 *     responses:
 *       200:
 *         description: Lista de solicitudes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Solicitud'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', controller.getRequests);

/**
 * @openapi
 * /requests:
 *   post:
 *     summary: Crear una nueva solicitud
 *     description: >
 *       Inserta una nueva solicitud en reto_c.solicitudes.
 *       Genera numero_ticket automáticamente y asigna estado "Recibida".
 *     tags:
 *       - Solicitudes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SolicitudInput'
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Solicitud'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', controller.createRequest);

/**
 * @openapi
 * /requests/{id}/status:
 *   put:
 *     summary: Actualizar el estado de una solicitud
 *     description: >
 *       Cambia el estado de la solicitud identificada por `id`.
 *       Estados permitidos: Recibida, En revisión, Resuelta, Rechazada, Cancelada.
 *     tags:
 *       - Solicitudes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusUpdate'
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatusUpdateResponse'
 *       400:
 *         description: Estado inválido o campo faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/status', controller.updateStatus);

module.exports = router;

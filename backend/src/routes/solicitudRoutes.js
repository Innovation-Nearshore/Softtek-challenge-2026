const express = require('express');
const SolicitudController = require('../controllers/SolicitudController');
const {
  validateCreateSolicitud,
  validateUpdateStatus,
  validateGetById,
  validateGetHistorial,
  validateListFilters,
  handleValidationErrors,
} = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * GET /api/solicitudes - Listar todas las solicitudes (con filtros opcionales)
 */
router.get(
  '/',
  validateListFilters,
  handleValidationErrors,
  SolicitudController.list
);

/**
 * GET /api/solicitudes/metricas/dashboard - Obtener métricas del dashboard
 */
router.get('/metricas/dashboard', SolicitudController.getMetricas);

/**
 * GET /api/solicitudes/referencias/tipos - Obtener tipos de solicitud
 */
router.get('/referencias/tipos', SolicitudController.getTiposSolicitud);

/**
 * GET /api/solicitudes/referencias/areas - Obtener áreas
 */
router.get('/referencias/areas', SolicitudController.getAreas);

/**
 * POST /api/solicitudes - Crear nueva solicitud
 */
router.post(
  '/',
  validateCreateSolicitud,
  handleValidationErrors,
  SolicitudController.create
);

/**
 * GET /api/solicitudes/:id - Obtener solicitud por ID (con historial)
 */
router.get(
  '/:id',
  validateGetById,
  handleValidationErrors,
  SolicitudController.getById
);

/**
 * GET /api/solicitudes/:id/historial - Obtener historial de solicitud
 */
router.get(
  '/:id/historial',
  validateGetHistorial,
  handleValidationErrors,
  SolicitudController.getHistorial
);

/**
 * PATCH /api/solicitudes/:id/status - Actualizar estado de solicitud
 */
router.patch(
  '/:id/status',
  validateUpdateStatus,
  handleValidationErrors,
  SolicitudController.updateStatus
);

module.exports = router;

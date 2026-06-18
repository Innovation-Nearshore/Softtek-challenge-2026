'use strict';

const solicitudesService = require('../services/solicitudesService');
const historialRepo = require('../repositories/historialRepository');

/**
 * POST /api/requests
 * Create a new solicitud.
 */
async function createSolicitud(req, res, next) {
  try {
    const solicitud = await solicitudesService.createSolicitud(req.body);
    return res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente.',
      data: solicitud,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/requests
 * List all solicitudes, optionally filtered by tipo and/or urgencia.
 */
async function getSolicitudes(req, res, next) {
  try {
    const { tipo, urgencia } = req.query;
    const filters = {};
    if (tipo) filters.tipoSolicitudId = Number(tipo);
    if (urgencia) filters.urgencia = urgencia;

    const solicitudes = await solicitudesService.getSolicitudes(filters);
    return res.json({
      success: true,
      data: solicitudes,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/requests/:id
 * Get a single solicitud by id.
 */
async function getSolicitudById(req, res, next) {
  try {
    const solicitud = await solicitudesService.getSolicitudById(Number(req.params.id));
    return res.json({
      success: true,
      data: solicitud,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/requests/:id/status
 * Advance the state of a solicitud.
 * Body: { estado, usuario?, comentario?, asignadoA? }
 */
async function changeStatus(req, res, next) {
  try {
    const solicitud = await solicitudesService.changeStatus(
      Number(req.params.id),
      req.body
    );
    return res.json({
      success: true,
      message: `Estado actualizado a "${solicitud.estado}".`,
      data: solicitud,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/requests/:id/history
 * Get the full historial for a solicitud.
 */
async function getHistory(req, res, next) {
  try {
    // Verify the solicitud exists first
    await solicitudesService.getSolicitudById(Number(req.params.id));

    const historial = await historialRepo.findBySolicitudId(Number(req.params.id));
    return res.json({
      success: true,
      data: historial,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/requests/:id/assignee
 * Assign a responsible person. Only allowed when estado = "En revisión".
 * Body: { asignadoA }
 */
async function updateAssignee(req, res, next) {
  try {
    const { asignadoA } = req.body;
    const solicitud = await solicitudesService.assignResponsible(
      Number(req.params.id),
      asignadoA
    );
    return res.json({
      success: true,
      message: 'Responsable asignado exitosamente.',
      data: solicitud,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createSolicitud,
  getSolicitudes,
  getSolicitudById,
  changeStatus,
  getHistory,
  updateAssignee,
};

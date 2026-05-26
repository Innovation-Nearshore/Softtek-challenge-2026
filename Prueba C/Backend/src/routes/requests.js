'use strict';

const { Router } = require('express');
const {
  listAreas,
  listTipos,
  listRequests,
  getRequest,
  createRequest,
  updateStatus,
  deleteRequest,
  clearAllRequests,
} = require('../controllers/requestsController');

// ─── Areas router ─────────────────────────────────────────────────────────────
const areasRouter = Router();

/** GET /api/areas — list all areas */
areasRouter.get('/', listAreas);

// ─── Tipos de solicitud router ────────────────────────────────────────────────
const tiposRouter = Router();

/** GET /api/tipos-solicitud — list all request types */
tiposRouter.get('/', listTipos);

// ─── Solicitudes router ───────────────────────────────────────────────────────
const requestsRouter = Router();

/**
 * @route  DELETE /api/requests
 * @desc   Clear ALL solicitudes (must be before /:id to avoid misrouting)
 */
requestsRouter.delete('/', clearAllRequests);

/**
 * @route  GET /api/requests
 * @desc   List solicitudes (optional ?tipo_id=&urgencia= filters)
 */
requestsRouter.get('/', listRequests);

/**
 * @route  POST /api/requests
 * @desc   Create a new solicitud
 */
requestsRouter.post('/', createRequest);

/**
 * @route  GET /api/requests/:id
 * @desc   Get a single solicitud by id
 */
requestsRouter.get('/:id', getRequest);

/**
 * @route  PATCH /api/requests/:id/status
 * @desc   Update the estado of a solicitud (logs change in historial_solicitudes)
 */
requestsRouter.patch('/:id/status', updateStatus);

/**
 * @route  DELETE /api/requests/:id
 * @desc   Delete a single solicitud
 */
requestsRouter.delete('/:id', deleteRequest);

module.exports = { areasRouter, tiposRouter, requestsRouter };

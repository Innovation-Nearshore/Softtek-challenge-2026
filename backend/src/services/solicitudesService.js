'use strict';

const pool = require('../config/database');
const solicitudesRepo = require('../repositories/solicitudesRepository');
const historialRepo = require('../repositories/historialRepository');
const tiposSolicitudRepo = require('../repositories/tiposSolicitudRepository');
const AppError = require('../utils/AppError');

// ── State machine ────────────────────────────────────────────────────────────
const VALID_TRANSITIONS = {
  Recibida: 'En revisión',
  'En revisión': 'Resuelta',
};

const TERMINAL_STATES = new Set(['Resuelta', 'Rechazada', 'Cancelada']);

/**
 * Validate whether a state transition is allowed.
 * Throws AppError (409) on invalid transition.
 */
function validateTransition(currentState, nextState) {
  if (TERMINAL_STATES.has(currentState)) {
    throw new AppError(
      `No se puede modificar una solicitud con estado "${currentState}".`,
      409
    );
  }

  const allowed = VALID_TRANSITIONS[currentState];
  if (!allowed || allowed !== nextState) {
    throw new AppError(
      `Transición inválida: no se puede pasar de "${currentState}" a "${nextState}". ` +
        `El siguiente estado permitido es "${allowed || 'ninguno'}".`,
      409
    );
  }
}

// ── Ticket number generation ─────────────────────────────────────────────────
/**
 * Generate a unique ticket number in the format TKT-YYYYMMDD-XXXX.
 */
function generateTicketNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `TKT-${datePart}-${randomPart}`;
}

// ── Service methods ──────────────────────────────────────────────────────────

/**
 * Create a new solicitud.
 * Sets estado = 'Recibida', calculates fecha_vencimiento from SLA,
 * inserts the solicitud, then inserts the initial historial record.
 *
 * @param {object} payload
 * @returns {Promise<object>} created solicitud
 */
async function createSolicitud(payload) {
  const {
    tipoSolicitudId,
    titulo,
    descripcion,
    urgencia,
    solicitante,
    emailSolicitante,
    areaSolicitanteId,
  } = payload;

  // Fetch the tipo to get SLA hours
  const tipos = await tiposSolicitudRepo.getAll();
  const tipo = tipos.find((t) => t.id === Number(tipoSolicitudId));
  if (!tipo) {
    throw new AppError(`Tipo de solicitud con id ${tipoSolicitudId} no encontrado.`, 404);
  }

  const fechaVencimiento = new Date(Date.now() + tipo.slaHoras * 60 * 60 * 1000);
  const numeroTicket = generateTicketNumber();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const newSolicitud = await solicitudesRepo.create(
      {
        numeroTicket,
        tipoSolicitudId,
        titulo,
        descripcion,
        urgencia,
        solicitante,
        emailSolicitante,
        areaSolicitanteId,
        fechaVencimiento,
      },
      client
    );

    // Insert initial historial record
    await historialRepo.create(
      {
        solicitudId: newSolicitud.id,
        estadoAnterior: null,
        estadoNuevo: 'Recibida',
        usuario: solicitante,
        comentario: 'Solicitud creada',
      },
      client
    );

    await client.query('COMMIT');

    // Return full solicitud with joined data
    return solicitudesRepo.findById(newSolicitud.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Advance the state of a solicitud.
 * Validates the transition, updates the solicitud, and inserts a historial record,
 * all within a single transaction.
 *
 * @param {number} id - solicitud id
 * @param {object} payload - { estado, usuario, comentario?, asignadoA? }
 * @returns {Promise<object>} updated solicitud
 */
async function changeStatus(id, payload) {
  const { estado: nextState, usuario, comentario, asignadoA } = payload;

  const solicitud = await solicitudesRepo.findById(id);
  if (!solicitud) {
    throw new AppError(`Solicitud con id ${id} no encontrada.`, 404);
  }

  validateTransition(solicitud.estado, nextState);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const fechaResolucion = nextState === 'Resuelta' ? new Date() : null;

    await solicitudesRepo.updateStatus(
      id,
      {
        estado: nextState,
        asignadoA: asignadoA || null,
        fechaResolucion,
      },
      client
    );

    await historialRepo.create(
      {
        solicitudId: id,
        estadoAnterior: solicitud.estado,
        estadoNuevo: nextState,
        usuario: usuario || 'Sistema',
        comentario: comentario || null,
      },
      client
    );

    await client.query('COMMIT');

    return solicitudesRepo.findById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Assign a responsible person to a solicitud.
 * Only allowed when the solicitud is in "En revisión" state.
 *
 * @param {number} id
 * @param {string} asignadoA
 * @returns {Promise<object>} updated solicitud
 */
async function assignResponsible(id, asignadoA) {
  const solicitud = await solicitudesRepo.findById(id);
  if (!solicitud) {
    throw new AppError(`Solicitud con id ${id} no encontrada.`, 404);
  }

  if (solicitud.estado !== 'En revisión') {
    throw new AppError(
      `Solo se puede asignar un responsable cuando la solicitud está "En revisión". Estado actual: "${solicitud.estado}".`,
      409
    );
  }

  await solicitudesRepo.updateAssignee(id, asignadoA);
  return solicitudesRepo.findById(id);
}

/**
 * Get a single solicitud by id.
 * @param {number} id
 */
async function getSolicitudById(id) {
  const solicitud = await solicitudesRepo.findById(id);
  if (!solicitud) {
    throw new AppError(`Solicitud con id ${id} no encontrada.`, 404);
  }
  return solicitud;
}

/**
 * Get all solicitudes with optional filters.
 * @param {object} filters
 */
async function getSolicitudes(filters) {
  return solicitudesRepo.findAll(filters);
}

/**
 * Get dashboard metrics: counts by estado and by urgencia, plus high-risk alert count.
 * Delegates all aggregation to PostgreSQL.
 */
async function getMetricas() {
  return solicitudesRepo.getMetricas();
}

module.exports = {
  createSolicitud,
  changeStatus,
  assignResponsible,
  getSolicitudById,
  getSolicitudes,
  getMetricas,
};

'use strict';

const pool = require('../config/database');

/**
 * Map a raw DB row to a camelCase object.
 */
function mapRow(r) {
  return {
    id: r.id,
    numeroTicket: r.numero_ticket,
    tipoSolicitudId: r.tipo_solicitud_id,
    tipoSolicitudNombre: r.tipo_solicitud_nombre,
    titulo: r.titulo,
    descripcion: r.descripcion,
    urgencia: r.urgencia,
    estado: r.estado,
    solicitante: r.solicitante,
    emailSolicitante: r.email_solicitante,
    areaSolicitanteId: r.area_solicitante_id,
    areaSolicitanteNombre: r.area_solicitante_nombre,
    areaAsignadaId: r.area_asignada_id,
    areaAsignadaNombre: r.area_asignada_nombre,
    asignadoA: r.asignado_a,
    fechaCreacion: r.fecha_creacion,
    fechaVencimiento: r.fecha_vencimiento,
    fechaResolucion: r.fecha_resolucion,
    solucion: r.solucion,
    calificacion: r.calificacion,
    comentarioCalificacion: r.comentario_calificacion,
  };
}

const BASE_SELECT = `
  SELECT
    s.id,
    s.numero_ticket,
    s.tipo_solicitud_id,
    ts.nombre   AS tipo_solicitud_nombre,
    s.titulo,
    s.descripcion,
    s.urgencia,
    s.estado,
    s.solicitante,
    s.email_solicitante,
    s.area_solicitante_id,
    aso.nombre  AS area_solicitante_nombre,
    s.area_asignada_id,
    aas.nombre  AS area_asignada_nombre,
    s.asignado_a,
    s.fecha_creacion,
    s.fecha_vencimiento,
    s.fecha_resolucion,
    s.solucion,
    s.calificacion,
    s.comentario_calificacion
  FROM solicitudes s
  JOIN tipos_solicitud ts  ON ts.id = s.tipo_solicitud_id
  JOIN areas aso           ON aso.id = s.area_solicitante_id
  LEFT JOIN areas aas      ON aas.id = s.area_asignada_id
`;

/**
 * Insert a new solicitud. Returns the created row.
 * @param {object} data
 * @param {object} [client] - optional pg client for transactions
 */
async function create(data, client) {
  const runner = client || pool;
  const {
    numeroTicket,
    tipoSolicitudId,
    titulo,
    descripcion,
    urgencia,
    solicitante,
    emailSolicitante,
    areaSolicitanteId,
    fechaVencimiento,
  } = data;

  const { rows } = await runner.query(
    `INSERT INTO solicitudes
       (numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia,
        estado, solicitante, email_solicitante, area_solicitante_id, fecha_vencimiento)
     VALUES ($1, $2, $3, $4, $5, 'Recibida', $6, $7, $8, $9)
     RETURNING *`,
    [
      numeroTicket,
      tipoSolicitudId,
      titulo,
      descripcion,
      urgencia,
      solicitante,
      emailSolicitante,
      areaSolicitanteId,
      fechaVencimiento,
    ]
  );
  return rows[0];
}

/**
 * Find all solicitudes with optional filters.
 * @param {object} filters - { tipoSolicitudId?, urgencia? }
 */
async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.tipoSolicitudId) {
    params.push(filters.tipoSolicitudId);
    conditions.push(`s.tipo_solicitud_id = $${params.length}`);
  }

  if (filters.urgencia) {
    params.push(filters.urgencia);
    conditions.push(`s.urgencia = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `${BASE_SELECT} ${where} ORDER BY s.fecha_creacion DESC`,
    params
  );
  return rows.map(mapRow);
}

/**
 * Find a single solicitud by id.
 * @param {number} id
 */
async function findById(id) {
  const { rows } = await pool.query(
    `${BASE_SELECT} WHERE s.id = $1`,
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

/**
 * Update the estado (and optionally asignado_a and fecha_resolucion) of a solicitud.
 * @param {number} id
 * @param {object} data - { estado, asignadoA?, fechaResolucion? }
 * @param {object} [client]
 */
async function updateStatus(id, data, client) {
  const runner = client || pool;
  const { estado, asignadoA, fechaResolucion } = data;

  const { rows } = await runner.query(
    `UPDATE solicitudes
     SET estado            = $1,
         asignado_a        = COALESCE($2, asignado_a),
         fecha_resolucion  = COALESCE($3, fecha_resolucion)
     WHERE id = $4
     RETURNING *`,
    [estado, asignadoA || null, fechaResolucion || null, id]
  );
  return rows[0] || null;
}

/**
 * Update only the asignado_a field.
 * @param {number} id
 * @param {string} asignadoA
 * @param {object} [client]
 */
async function updateAssignee(id, asignadoA, client) {
  const runner = client || pool;
  const { rows } = await runner.query(
    `UPDATE solicitudes SET asignado_a = $1 WHERE id = $2 RETURNING *`,
    [asignadoA, id]
  );
  return rows[0] || null;
}

module.exports = { create, findAll, findById, updateStatus, updateAssignee };

'use strict';

const pool = require('../config/database');

/**
 * Insert a new historial record.
 * @param {object} data - { solicitudId, estadoAnterior, estadoNuevo, usuario, comentario }
 * @param {object} [client] - optional pg client for transactions
 */
async function create(data, client) {
  const runner = client || pool;
  const { solicitudId, estadoAnterior, estadoNuevo, usuario, comentario } = data;

  const { rows } = await runner.query(
    `INSERT INTO historial_solicitudes
       (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [solicitudId, estadoAnterior || null, estadoNuevo, usuario, comentario || null]
  );
  return rows[0];
}

/**
 * Find all historial records for a given solicitud, ordered chronologically.
 * @param {number} solicitudId
 */
async function findBySolicitudId(solicitudId) {
  const { rows } = await pool.query(
    `SELECT
       id,
       solicitud_id,
       estado_anterior,
       estado_nuevo,
       usuario,
       comentario,
       fecha_cambio
     FROM historial_solicitudes
     WHERE solicitud_id = $1
     ORDER BY fecha_cambio ASC`,
    [solicitudId]
  );
  return rows.map((r) => ({
    id: r.id,
    solicitudId: r.solicitud_id,
    estadoAnterior: r.estado_anterior,
    estadoNuevo: r.estado_nuevo,
    usuario: r.usuario,
    comentario: r.comentario,
    fechaCambio: r.fecha_cambio,
  }));
}

module.exports = { create, findBySolicitudId };

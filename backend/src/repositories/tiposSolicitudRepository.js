'use strict';

const pool = require('../config/database');

/**
 * Retrieve all tipos_solicitud ordered by nombre.
 * @returns {Promise<Array>}
 */
async function getAll() {
  const { rows } = await pool.query(
    `SELECT id, codigo, nombre, descripcion, sla_horas, requiere_aprobacion
     FROM tipos_solicitud
     ORDER BY nombre ASC`
  );
  return rows.map((r) => ({
    id: r.id,
    codigo: r.codigo,
    nombre: r.nombre,
    descripcion: r.descripcion,
    slaHoras: r.sla_horas,
    requiereAprobacion: r.requiere_aprobacion,
  }));
}

module.exports = { getAll };

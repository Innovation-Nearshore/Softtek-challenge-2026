'use strict';

const pool = require('../config/database');

/**
 * Retrieve all areas ordered by name.
 * @returns {Promise<Array>}
 */
async function getAll() {
  const { rows } = await pool.query(
    'SELECT id, nombre, descripcion, email_contacto FROM areas ORDER BY nombre ASC'
  );
  return rows.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
    emailContacto: r.email_contacto,
  }));
}

module.exports = { getAll };

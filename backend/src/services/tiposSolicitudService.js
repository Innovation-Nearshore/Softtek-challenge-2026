const db = require('../db/pool');

async function getAllTiposSolicitud() {
  const result = await db.query(
    `SELECT id, codigo, nombre, descripcion, sla_horas, requiere_aprobacion
     FROM tipos_solicitud
     ORDER BY nombre`
  );
  return result.rows;
}

module.exports = { getAllTiposSolicitud };

const db = require('../db/pool');

/**
 * Returns counts of solicitudes grouped by estado and by urgencia.
 * Both queries run against reto_c.solicitudes (schema set via search_path).
 */
async function getMetrics() {
  const [byEstadoResult, byUrgenciaResult] = await Promise.all([
    db.query(
      `SELECT estado, COUNT(*)::int AS total
       FROM solicitudes
       GROUP BY estado
       ORDER BY estado`
    ),
    db.query(
      `SELECT urgencia, COUNT(*)::int AS total
       FROM solicitudes
       GROUP BY urgencia
       ORDER BY urgencia`
    ),
  ]);

  return {
    byEstado: byEstadoResult.rows,
    byUrgencia: byUrgenciaResult.rows,
  };
}

module.exports = { getMetrics };

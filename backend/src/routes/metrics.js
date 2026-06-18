const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/metrics
// Returns aggregate counts from PostgreSQL — no client-side counting.
router.get('/', async (req, res, next) => {
  try {
    const [byEstado, byUrgencia] = await Promise.all([
      pool.query(`
        SELECT estado, COUNT(*)::int AS count
        FROM reto_c.solicitudes
        GROUP BY estado
        ORDER BY estado
      `),
      pool.query(`
        SELECT urgencia, COUNT(*)::int AS count
        FROM reto_c.solicitudes
        GROUP BY urgencia
        ORDER BY urgencia
      `),
    ]);

    // Ensure all expected categories appear even if count is 0
    const ESTADOS   = ['Recibida', 'En revisión', 'Resuelta'];
    const URGENCIAS = ['Alta', 'Media', 'Baja'];

    const estadoMap   = Object.fromEntries(byEstado.rows.map((r) => [r.estado, r.count]));
    const urgenciaMap = Object.fromEntries(byUrgencia.rows.map((r) => [r.urgencia, r.count]));

    res.json({
      by_estado:   ESTADOS.map((e) => ({ estado: e, count: estadoMap[e] ?? 0 })),
      by_urgencia: URGENCIAS.map((u) => ({ urgencia: u, count: urgenciaMap[u] ?? 0 })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

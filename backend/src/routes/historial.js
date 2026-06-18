const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/historial
router.get('/', async (req, res, next) => {
  try {
    const { tipo, urgencia, responsable, estado, ticket } = req.query;

    const conditions = [];
    const params = [];

    if (tipo) {
      params.push(`%${tipo}%`);
      conditions.push(`t.nombre ILIKE $${params.length}`);
    }
    if (urgencia) {
      params.push(urgencia);
      conditions.push(`s.urgencia = $${params.length}`);
    }
    if (responsable) {
      params.push(`%${responsable}%`);
      conditions.push(`h.usuario ILIKE $${params.length}`);
    }
    if (estado) {
      params.push(estado);
      conditions.push(`h.estado_nuevo = $${params.length}`);
    }
    if (ticket) {
      params.push(`%${ticket}%`);
      conditions.push(`s.numero_ticket ILIKE $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT
         h.id,
         h.solicitud_id,
         h.estado_anterior,
         h.estado_nuevo,
         h.usuario,
         h.comentario,
         h.fecha_cambio,
         s.numero_ticket,
         s.titulo,
         s.urgencia,
         s.solicitante,
         t.nombre AS tipo_solicitud_nombre,
         a.nombre AS area_solicitante_nombre
       FROM reto_c.historial_solicitudes h
       JOIN reto_c.solicitudes s ON s.id = h.solicitud_id
       JOIN reto_c.tipos_solicitud t ON t.id = s.tipo_solicitud_id
       JOIN reto_c.areas a ON a.id = s.area_solicitante_id
       ${where}
       ORDER BY h.fecha_cambio DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

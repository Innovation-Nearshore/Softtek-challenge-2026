const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/tipos-solicitud
router.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, descripcion, sla_horas, requiere_aprobacion FROM tipos_solicitud ORDER BY nombre'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

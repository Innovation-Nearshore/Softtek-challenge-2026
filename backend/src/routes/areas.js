const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/areas
router.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, descripcion, email_contacto FROM areas ORDER BY nombre'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

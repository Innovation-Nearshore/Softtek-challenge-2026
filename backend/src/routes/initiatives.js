const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { validateInitiative, validateStatus } = require('../middleware/validation');

const SCHEMA = process.env.DB_SCHEMA || 'reto_a';

// GET /api/initiatives — list all
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, responsable, estado, fecha_limite, prioridad, descripcion,
              fecha_creacion, fecha_actualizacion
       FROM ${SCHEMA}.iniciativas
       ORDER BY fecha_creacion DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/initiatives/:id — get single
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, nombre, responsable, estado, fecha_limite, prioridad, descripcion,
              fecha_creacion, fecha_actualizacion
       FROM ${SCHEMA}.iniciativas
       WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Iniciativa no encontrada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/initiatives — create new
router.post('/', validateInitiative, async (req, res, next) => {
  try {
    const { nombre, responsable, estado, fecha_limite, prioridad, descripcion } = req.body;
    const result = await pool.query(
      `INSERT INTO ${SCHEMA}.iniciativas (nombre, responsable, estado, fecha_limite, prioridad, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nombre, responsable, estado, fecha_limite, prioridad, descripcion,
                 fecha_creacion, fecha_actualizacion`,
      [nombre.trim(), responsable.trim(), estado, fecha_limite, prioridad, descripcion.trim()]
    );
    res.status(201).json({
      message: 'Iniciativa guardada correctamente.',
      initiative: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/initiatives/:id — full update
router.put('/:id', validateInitiative, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, responsable, estado, fecha_limite, prioridad, descripcion } = req.body;

    const result = await pool.query(
      `UPDATE ${SCHEMA}.iniciativas
       SET nombre = $1, responsable = $2, estado = $3, fecha_limite = $4,
           prioridad = $5, descripcion = $6, fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, nombre, responsable, estado, fecha_limite, prioridad, descripcion,
                 fecha_creacion, fecha_actualizacion`,
      [nombre.trim(), responsable.trim(), estado, fecha_limite, prioridad, descripcion.trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Iniciativa no encontrada.' });
    }

    res.json({
      message: 'Cambios guardados correctamente.',
      initiative: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/initiatives/:id/status — update status only
router.patch('/:id/status', validateStatus, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const result = await pool.query(
      `UPDATE ${SCHEMA}.iniciativas
       SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, nombre, responsable, estado, fecha_limite, prioridad, descripcion,
                 fecha_creacion, fecha_actualizacion`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Iniciativa no encontrada.' });
    }

    res.json({
      message: 'Estado actualizado correctamente.',
      initiative: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/initiatives/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM ${SCHEMA}.iniciativas WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Iniciativa no encontrada.' });
    }
    res.json({ message: 'Iniciativa eliminada correctamente.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

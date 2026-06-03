/* ============================================================
   ROUTES/PERIODOS.JS
   CRUD para reto_b.periodos
   ============================================================ */

'use strict';

const express = require('express');
const router  = express.Router();
const { query } = require('../db');

/* ── GET /api/periodos ───────────────────────────────────── */
router.get('/', async (req, res) => {
  const { anio, trimestre } = req.query;

  try {
    const conditions = [];
    const values     = [];

    if (anio) {
      values.push(parseInt(anio, 10));
      conditions.push(`anio = $${values.length}`);
    }
    if (trimestre) {
      values.push(parseInt(trimestre, 10));
      conditions.push(`trimestre = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT id, anio, mes, nombre_mes, trimestre,
             fecha_inicio, fecha_fin
      FROM   reto_b.periodos
      ${where}
      ORDER  BY anio DESC, mes ASC
    `;

    const result = await query(sql, values);
    res.json(result.rows);
  } catch (err) {
    console.error('[periodos GET /]', err.message);
    res.status(500).json({ error: 'Error al obtener períodos', detail: err.message });
  }
});

/* ── GET /api/periodos/:id ───────────────────────────────── */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      `SELECT id, anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin
       FROM   reto_b.periodos
       WHERE  id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Período no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[periodos GET /:id]', err.message);
    res.status(500).json({ error: 'Error al obtener el período', detail: err.message });
  }
});

/* ── POST /api/periodos ──────────────────────────────────── */
router.post('/', async (req, res) => {
  const { anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin } = req.body;

  if (!anio || !mes || !nombre_mes || !trimestre || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({
      error: 'Los campos anio, mes, nombre_mes, trimestre, fecha_inicio y fecha_fin son obligatorios.',
    });
  }

  try {
    const result = await query(
      `INSERT INTO reto_b.periodos (anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin`,
      [anio, mes, nombre_mes.trim(), trimestre, fecha_inicio, fecha_fin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un período para ese año y mes.' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Valor de mes o trimestre fuera de rango.' });
    }
    console.error('[periodos POST /]', err.message);
    res.status(500).json({ error: 'Error al crear el período', detail: err.message });
  }
});

/* ── PUT /api/periodos/:id ───────────────────────────────── */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin } = req.body;

  if (!anio || !mes || !nombre_mes || !trimestre || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({
      error: 'Los campos anio, mes, nombre_mes, trimestre, fecha_inicio y fecha_fin son obligatorios.',
    });
  }

  try {
    const result = await query(
      `UPDATE reto_b.periodos
       SET    anio         = $1,
              mes          = $2,
              nombre_mes   = $3,
              trimestre    = $4,
              fecha_inicio = $5,
              fecha_fin    = $6
       WHERE  id = $7
       RETURNING id, anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin`,
      [anio, mes, nombre_mes.trim(), trimestre, fecha_inicio, fecha_fin, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Período no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un período para ese año y mes.' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Valor de mes o trimestre fuera de rango.' });
    }
    console.error('[periodos PUT /:id]', err.message);
    res.status(500).json({ error: 'Error al actualizar el período', detail: err.message });
  }
});

/* ── DELETE /api/periodos/:id ────────────────────────────── */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      `DELETE FROM reto_b.periodos WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Período no encontrado' });
    }
    res.json({ message: 'Período eliminado correctamente', id: result.rows[0].id });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'No se puede eliminar el período porque tiene métricas asociadas.',
      });
    }
    console.error('[periodos DELETE /:id]', err.message);
    res.status(500).json({ error: 'Error al eliminar el período', detail: err.message });
  }
});

module.exports = router;

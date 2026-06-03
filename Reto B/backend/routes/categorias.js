/* ============================================================
   ROUTES/CATEGORIAS.JS
   CRUD para reto_b.categorias_metricas
   ============================================================ */

'use strict';

const express = require('express');
const router  = express.Router();
const { query } = require('../db');

/* ── GET /api/categorias ─────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT id, nombre, descripcion, color_hex
      FROM   reto_b.categorias_metricas
      ORDER  BY nombre ASC
    `;
    const result = await query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error('[categorias GET /]', err.message);
    res.status(500).json({ error: 'Error al obtener categorías', detail: err.message });
  }
});

/* ── GET /api/categorias/:id ─────────────────────────────── */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      `SELECT id, nombre, descripcion, color_hex
       FROM   reto_b.categorias_metricas
       WHERE  id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[categorias GET /:id]', err.message);
    res.status(500).json({ error: 'Error al obtener la categoría', detail: err.message });
  }
});

/* ── POST /api/categorias ────────────────────────────────── */
router.post('/', async (req, res) => {
  const { nombre, descripcion, color_hex } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El campo "nombre" es obligatorio.' });
  }

  try {
    const result = await query(
      `INSERT INTO reto_b.categorias_metricas (nombre, descripcion, color_hex)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, descripcion, color_hex`,
      [nombre.trim(), descripcion || null, color_hex || '#091FFD']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre.' });
    }
    console.error('[categorias POST /]', err.message);
    res.status(500).json({ error: 'Error al crear la categoría', detail: err.message });
  }
});

/* ── PUT /api/categorias/:id ─────────────────────────────── */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, color_hex } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El campo "nombre" es obligatorio.' });
  }

  try {
    const result = await query(
      `UPDATE reto_b.categorias_metricas
       SET    nombre      = $1,
              descripcion = $2,
              color_hex   = $3
       WHERE  id = $4
       RETURNING id, nombre, descripcion, color_hex`,
      [nombre.trim(), descripcion || null, color_hex || '#091FFD', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre.' });
    }
    console.error('[categorias PUT /:id]', err.message);
    res.status(500).json({ error: 'Error al actualizar la categoría', detail: err.message });
  }
});

/* ── DELETE /api/categorias/:id ──────────────────────────── */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      `DELETE FROM reto_b.categorias_metricas WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json({ message: 'Categoría eliminada correctamente', id: result.rows[0].id });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'No se puede eliminar la categoría porque tiene métricas asociadas.',
      });
    }
    console.error('[categorias DELETE /:id]', err.message);
    res.status(500).json({ error: 'Error al eliminar la categoría', detail: err.message });
  }
});

module.exports = router;

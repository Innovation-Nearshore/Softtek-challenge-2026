/* ============================================================
   ROUTES/METRICAS.JS
   CRUD para reto_b.metricas_mensuales
   Con JOIN a periodos y categorias_metricas para enriquecer
   la respuesta con nombres y colores.
   ============================================================ */

'use strict';

const express = require('express');
const router  = express.Router();
const { query } = require('../db');

/* ── Columnas base con JOIN ─────────────────────────────── */
const SELECT_BASE = `
  SELECT
    m.id,
    m.periodo_id,
    m.categoria_id,
    m.nombre_metrica,
    m.valor_actual,
    m.valor_objetivo,
    m.unidad,
    m.notas,
    m.fecha_registro,
    p.anio,
    p.mes,
    p.nombre_mes,
    p.trimestre,
    c.nombre        AS categoria_nombre,
    c.color_hex     AS categoria_color
  FROM   reto_b.metricas_mensuales  m
  JOIN   reto_b.periodos             p ON p.id = m.periodo_id
  JOIN   reto_b.categorias_metricas  c ON c.id = m.categoria_id
`;

/* ── GET /api/metricas ───────────────────────────────────── */
router.get('/', async (req, res) => {
  const { categoria_id, periodo_id, anio, trimestre, nombre_metrica } = req.query;

  try {
    const conditions = [];
    const values     = [];

    if (categoria_id) {
      values.push(parseInt(categoria_id, 10));
      conditions.push(`m.categoria_id = $${values.length}`);
    }
    if (periodo_id) {
      values.push(parseInt(periodo_id, 10));
      conditions.push(`m.periodo_id = $${values.length}`);
    }
    if (anio) {
      values.push(parseInt(anio, 10));
      conditions.push(`p.anio = $${values.length}`);
    }
    if (trimestre) {
      values.push(parseInt(trimestre, 10));
      conditions.push(`p.trimestre = $${values.length}`);
    }
    if (nombre_metrica) {
      values.push(`%${nombre_metrica}%`);
      conditions.push(`m.nombre_metrica ILIKE $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      ${SELECT_BASE}
      ${where}
      ORDER BY p.anio DESC, p.mes DESC, c.nombre ASC, m.nombre_metrica ASC
    `;

    const result = await query(sql, values);
    res.json(result.rows);
  } catch (err) {
    console.error('[metricas GET /]', err.message);
    res.status(500).json({ error: 'Error al obtener métricas', detail: err.message });
  }
});

/* ── GET /api/metricas/:id ───────────────────────────────── */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      `${SELECT_BASE} WHERE m.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Métrica no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[metricas GET /:id]', err.message);
    res.status(500).json({ error: 'Error al obtener la métrica', detail: err.message });
  }
});

/* ── POST /api/metricas ──────────────────────────────────── */
router.post('/', async (req, res) => {
  const { periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas } = req.body;

  // Validaciones básicas
  if (!periodo_id || !categoria_id || !nombre_metrica || valor_actual == null) {
    return res.status(400).json({
      error: 'Los campos periodo_id, categoria_id, nombre_metrica y valor_actual son obligatorios.',
    });
  }
  if (isNaN(Number(valor_actual)) || Number(valor_actual) < 0) {
    return res.status(400).json({ error: 'valor_actual debe ser un número mayor o igual a 0.' });
  }
  if (valor_objetivo != null && (isNaN(Number(valor_objetivo)) || Number(valor_objetivo) < 0)) {
    return res.status(400).json({ error: 'valor_objetivo debe ser un número mayor o igual a 0.' });
  }

  try {
    const insertResult = await query(
      `INSERT INTO reto_b.metricas_mensuales
         (periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        parseInt(periodo_id, 10),
        parseInt(categoria_id, 10),
        nombre_metrica.trim(),
        Number(valor_actual),
        valor_objetivo != null ? Number(valor_objetivo) : null,
        unidad || 'unidades',
        notas || null,
      ]
    );

    // Retornar el registro completo con JOIN
    const full = await query(`${SELECT_BASE} WHERE m.id = $1`, [insertResult.rows[0].id]);
    res.status(201).json(full.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Ya existe una métrica con ese período, categoría y nombre.',
      });
    }
    if (err.code === '23503') {
      return res.status(400).json({
        error: 'El período o categoría indicados no existen.',
      });
    }
    console.error('[metricas POST /]', err.message);
    res.status(500).json({ error: 'Error al crear la métrica', detail: err.message });
  }
});

/* ── PUT /api/metricas/:id ───────────────────────────────── */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas } = req.body;

  if (!periodo_id || !categoria_id || !nombre_metrica || valor_actual == null) {
    return res.status(400).json({
      error: 'Los campos periodo_id, categoria_id, nombre_metrica y valor_actual son obligatorios.',
    });
  }
  if (isNaN(Number(valor_actual)) || Number(valor_actual) < 0) {
    return res.status(400).json({ error: 'valor_actual debe ser un número mayor o igual a 0.' });
  }

  try {
    const updateResult = await query(
      `UPDATE reto_b.metricas_mensuales
       SET    periodo_id    = $1,
              categoria_id  = $2,
              nombre_metrica = $3,
              valor_actual  = $4,
              valor_objetivo = $5,
              unidad        = $6,
              notas         = $7
       WHERE  id = $8
       RETURNING id`,
      [
        parseInt(periodo_id, 10),
        parseInt(categoria_id, 10),
        nombre_metrica.trim(),
        Number(valor_actual),
        valor_objetivo != null ? Number(valor_objetivo) : null,
        unidad || 'unidades',
        notas || null,
        id,
      ]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Métrica no encontrada' });
    }

    const full = await query(`${SELECT_BASE} WHERE m.id = $1`, [id]);
    res.json(full.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Ya existe una métrica con ese período, categoría y nombre.',
      });
    }
    if (err.code === '23503') {
      return res.status(400).json({ error: 'El período o categoría indicados no existen.' });
    }
    console.error('[metricas PUT /:id]', err.message);
    res.status(500).json({ error: 'Error al actualizar la métrica', detail: err.message });
  }
});

/* ── DELETE /api/metricas/:id ────────────────────────────── */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      `DELETE FROM reto_b.metricas_mensuales WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Métrica no encontrada' });
    }
    res.json({ message: 'Métrica eliminada correctamente', id: result.rows[0].id });
  } catch (err) {
    console.error('[metricas DELETE /:id]', err.message);
    res.status(500).json({ error: 'Error al eliminar la métrica', detail: err.message });
  }
});

/* ── POST /api/metricas/bulk ─────────────────────────────── */
// Carga masiva de métricas desde CSV parseado en el frontend
router.post('/bulk', async (req, res) => {
  const { rows } = req.body; // Array de objetos métrica

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de métricas en el campo "rows".' });
  }

  const inserted = [];
  const errors   = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const { periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas } = row;

    if (!periodo_id || !categoria_id || !nombre_metrica || valor_actual == null) {
      errors.push({ fila: i + 1, error: 'Campos obligatorios faltantes (periodo_id, categoria_id, nombre_metrica, valor_actual).' });
      continue;
    }

    try {
      const r = await query(
        `INSERT INTO reto_b.metricas_mensuales
           (periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (periodo_id, categoria_id, nombre_metrica) DO UPDATE
           SET valor_actual  = EXCLUDED.valor_actual,
               valor_objetivo = EXCLUDED.valor_objetivo,
               unidad        = EXCLUDED.unidad,
               notas         = EXCLUDED.notas
         RETURNING id`,
        [
          parseInt(periodo_id, 10),
          parseInt(categoria_id, 10),
          nombre_metrica.trim(),
          Number(valor_actual),
          valor_objetivo != null ? Number(valor_objetivo) : null,
          unidad || 'unidades',
          notas || null,
        ]
      );
      inserted.push(r.rows[0].id);
    } catch (err) {
      errors.push({ fila: i + 1, error: err.message });
    }
  }

  res.json({
    message: `Proceso completado: ${inserted.length} insertadas/actualizadas, ${errors.length} errores.`,
    insertadas: inserted.length,
    errores: errors,
  });
});

module.exports = router;

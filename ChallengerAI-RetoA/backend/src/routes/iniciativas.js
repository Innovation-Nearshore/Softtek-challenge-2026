const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/iniciativas - List all, with optional ?estado= and/or ?prioridad= filters
router.get('/', async (req, res) => {
  try {
    const { estado, prioridad } = req.query;
    let query = `
      SELECT id, nombre, responsable, estado, fecha_limite, prioridad, descripcion,
             fecha_creacion, fecha_actualizacion
      FROM reto_a.iniciativas
    `;
    const params = [];
    const conditions = [];

    if (estado) {
      params.push(estado);
      conditions.push(`estado = $${params.length}`);
    }

    if (prioridad) {
      params.push(prioridad);
      conditions.push(`prioridad = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY fecha_creacion DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener iniciativas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

// GET /api/iniciativas/proximos-vencimientos - Initiatives due in the next 7 days (must be before /:id)
router.get('/proximos-vencimientos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, responsable, estado, fecha_limite, prioridad, descripcion,
             fecha_creacion, fecha_actualizacion
      FROM reto_a.iniciativas
      WHERE fecha_limite IS NOT NULL
        AND fecha_limite >= CURRENT_DATE
        AND fecha_limite <= CURRENT_DATE + INTERVAL '7 days'
      ORDER BY fecha_limite ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener próximos vencimientos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

// GET /api/iniciativas/stats - Counts grouped by estado (must be before /:id)
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT estado, COUNT(*)::int AS total
      FROM reto_a.iniciativas
      GROUP BY estado
    `);

    const stats = {
      'Pendiente': 0,
      'En curso': 0,
      'Completado': 0,
    };

    result.rows.forEach((row) => {
      if (Object.prototype.hasOwnProperty.call(stats, row.estado)) {
        stats[row.estado] = row.total;
      }
    });

    const total = Object.values(stats).reduce((sum, v) => sum + v, 0);

    res.json({ success: true, data: { ...stats, total } });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

// GET /api/iniciativas/:id - Get one by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, nombre, responsable, estado, fecha_limite, prioridad, descripcion,
              fecha_creacion, fecha_actualizacion
       FROM reto_a.iniciativas
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Iniciativa no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener iniciativa:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

// POST /api/iniciativas - Create new record
router.post('/', async (req, res) => {
  try {
    const { nombre, responsable, estado, fecha_limite, prioridad, descripcion } = req.body;

    // Per-field validation
    const fieldErrors = {};
    if (!nombre || !String(nombre).trim()) fieldErrors.nombre = 'El nombre es obligatorio.';
    if (!responsable || !String(responsable).trim()) fieldErrors.responsable = 'El responsable es obligatorio.';
    if (!estado) fieldErrors.estado = 'El estado es obligatorio.';
    if (!fecha_limite) fieldErrors.fecha_limite = 'La fecha límite es obligatoria.';
    if (!prioridad) fieldErrors.prioridad = 'La prioridad es obligatoria.';
    if (!descripcion || !String(descripcion).trim()) fieldErrors.descripcion = 'La descripción es obligatoria.';

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Campos obligatorios incompletos.',
        fieldErrors,
      });
    }

    const validEstados = ['Pendiente', 'En curso', 'Completado'];
    if (!validEstados.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Valores permitidos: ${validEstados.join(', ')}`,
        fieldErrors: { estado: `Valor inválido. Use: ${validEstados.join(', ')}` },
      });
    }

    const validPrioridades = ['Alta', 'Media', 'Baja'];
    if (!validPrioridades.includes(prioridad)) {
      return res.status(400).json({
        success: false,
        message: `Prioridad inválida. Valores permitidos: ${validPrioridades.join(', ')}`,
        fieldErrors: { prioridad: `Valor inválido. Use: ${validPrioridades.join(', ')}` },
      });
    }

    const result = await pool.query(
      `INSERT INTO reto_a.iniciativas (nombre, responsable, estado, fecha_limite, prioridad, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nombre, responsable, estado, fecha_limite, prioridad, descripcion,
                 fecha_creacion, fecha_actualizacion`,
      [nombre.trim(), responsable.trim(), estado, fecha_limite, prioridad, descripcion.trim()]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al crear iniciativa:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

// PUT /api/iniciativas/:id - Update existing record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, responsable, estado, fecha_limite, prioridad, descripcion } = req.body;

    // Per-field validation
    const fieldErrors = {};
    if (!nombre || !String(nombre).trim()) fieldErrors.nombre = 'El nombre es obligatorio.';
    if (!responsable || !String(responsable).trim()) fieldErrors.responsable = 'El responsable es obligatorio.';
    if (!estado) fieldErrors.estado = 'El estado es obligatorio.';
    if (!fecha_limite) fieldErrors.fecha_limite = 'La fecha límite es obligatoria.';
    if (!prioridad) fieldErrors.prioridad = 'La prioridad es obligatoria.';
    if (!descripcion || !String(descripcion).trim()) fieldErrors.descripcion = 'La descripción es obligatoria.';

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Campos obligatorios incompletos.',
        fieldErrors,
      });
    }

    const validEstados = ['Pendiente', 'En curso', 'Completado'];
    if (!validEstados.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Valores permitidos: ${validEstados.join(', ')}`,
        fieldErrors: { estado: `Valor inválido. Use: ${validEstados.join(', ')}` },
      });
    }

    const validPrioridades = ['Alta', 'Media', 'Baja'];
    if (!validPrioridades.includes(prioridad)) {
      return res.status(400).json({
        success: false,
        message: `Prioridad inválida. Valores permitidos: ${validPrioridades.join(', ')}`,
        fieldErrors: { prioridad: `Valor inválido. Use: ${validPrioridades.join(', ')}` },
      });
    }

    const result = await pool.query(
      `UPDATE reto_a.iniciativas
       SET nombre = $1, responsable = $2, estado = $3, fecha_limite = $4,
           prioridad = $5, descripcion = $6, fecha_actualizacion = NOW()
       WHERE id = $7
       RETURNING id, nombre, responsable, estado, fecha_limite, prioridad, descripcion,
                 fecha_creacion, fecha_actualizacion`,
      [nombre.trim(), responsable.trim(), estado, fecha_limite, prioridad, descripcion.trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Iniciativa no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar iniciativa:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

// DELETE /api/iniciativas/:id - Delete record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM reto_a.iniciativas WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Iniciativa no encontrada' });
    }

    res.json({ success: true, message: 'Iniciativa eliminada correctamente', id: result.rows[0].id });
  } catch (error) {
    console.error('Error al eliminar iniciativa:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

module.exports = router;

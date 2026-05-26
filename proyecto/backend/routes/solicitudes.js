const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/solicitudes/dashboard/metrics
// MUST be defined BEFORE /:id route
router.get('/dashboard/metrics', async (req, res) => {
  try {
    const totalResult = await pool.query(
      'SELECT COUNT(*) AS total FROM reto_c.solicitudes'
    );

    const byEstadoResult = await pool.query(
      `SELECT estado, COUNT(*) AS cantidad
       FROM reto_c.solicitudes
       GROUP BY estado
       ORDER BY estado`
    );

    const byUrgenciaResult = await pool.query(
      `SELECT urgencia, COUNT(*) AS cantidad
       FROM reto_c.solicitudes
       GROUP BY urgencia
       ORDER BY urgencia`
    );

    res.json({
      total: parseInt(totalResult.rows[0].total),
      por_estado: byEstadoResult.rows,
      por_urgencia: byUrgenciaResult.rows,
    });
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    res.status(500).json({ error: 'Error fetching dashboard metrics', detail: err.message });
  }
});

// GET /api/solicitudes
router.get('/', async (req, res) => {
  try {
    const { urgencia, tipo } = req.query;
    const params = [];
    const conditions = [];

    let query = `
      SELECT
        s.id,
        s.numero_ticket,
        s.titulo,
        s.descripcion,
        s.urgencia,
        s.estado,
        s.solicitante,
        s.email_solicitante,
        s.fecha_creacion,
        t.nombre AS tipo_nombre,
        t.codigo AS tipo_codigo,
        a.nombre AS area_nombre
      FROM reto_c.solicitudes s
      LEFT JOIN reto_c.tipos_solicitud t ON s.tipo_solicitud_id = t.id
      LEFT JOIN reto_c.areas a ON s.area_solicitante_id = a.id
    `;

    if (urgencia) {
      params.push(urgencia);
      conditions.push(`s.urgencia = $${params.length}`);
    }

    if (tipo) {
      params.push(tipo);
      conditions.push(`t.codigo = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY s.fecha_creacion DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching solicitudes:', err);
    res.status(500).json({ error: 'Error fetching solicitudes', detail: err.message });
  }
});

// GET /api/solicitudes/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const solicitudResult = await pool.query(
      `SELECT
        s.id,
        s.numero_ticket,
        s.titulo,
        s.descripcion,
        s.urgencia,
        s.estado,
        s.solicitante,
        s.email_solicitante,
        s.tipo_solicitud_id,
        s.area_solicitante_id,
        s.area_asignada_id,
        s.asignado_a,
        s.fecha_creacion,
        s.fecha_vencimiento,
        s.fecha_resolucion,
        s.solucion,
        s.calificacion,
        t.nombre AS tipo_nombre,
        t.codigo AS tipo_codigo,
        a.nombre AS area_nombre
      FROM reto_c.solicitudes s
      LEFT JOIN reto_c.tipos_solicitud t ON s.tipo_solicitud_id = t.id
      LEFT JOIN reto_c.areas a ON s.area_solicitante_id = a.id
      WHERE s.id = $1`,
      [id]
    );

    if (solicitudResult.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud not found' });
    }

    const historialResult = await pool.query(
      `SELECT id, solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio
       FROM reto_c.historial_solicitudes
       WHERE solicitud_id = $1
       ORDER BY fecha_cambio ASC`,
      [id]
    );

    res.json({
      solicitud: solicitudResult.rows[0],
      historial: historialResult.rows,
    });
  } catch (err) {
    console.error('Error fetching solicitud:', err);
    res.status(500).json({ error: 'Error fetching solicitud', detail: err.message });
  }
});

// POST /api/solicitudes
router.post('/', async (req, res) => {
  try {
    const {
      tipo_solicitud_id,
      titulo,
      descripcion,
      urgencia,
      solicitante,
      email_solicitante,
      area_solicitante_id,
    } = req.body;

    if (!tipo_solicitud_id || !titulo || !descripcion || !urgencia || !solicitante || !email_solicitante || !area_solicitante_id) {
      return res.status(400).json({
        error: 'Missing required fields: tipo_solicitud_id, titulo, descripcion, urgencia, solicitante, email_solicitante, area_solicitante_id',
      });
    }

    // Insert with a temporary ticket, then update using the generated ID
    const insertResult = await pool.query(
      `INSERT INTO reto_c.solicitudes
         (numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado, solicitante, email_solicitante, area_solicitante_id)
       VALUES
         ('TEMP-' || extract(epoch from now())::bigint, $1, $2, $3, $4, 'Recibida', $5, $6, $7)
       RETURNING id, fecha_creacion`,
      [tipo_solicitud_id, titulo, descripcion, urgencia, solicitante, email_solicitante, area_solicitante_id]
    );

    const newId = insertResult.rows[0].id;
    const fechaCreacion = insertResult.rows[0].fecha_creacion;

    // Generate numero_ticket: TK-YYMM-### matching existing data format
    const dateObj = new Date(fechaCreacion);
    const yy = String(dateObj.getFullYear()).slice(-2);
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const numero_ticket = `TK-${yy}${mm}-${String(newId).padStart(3, '0')}`;

    await pool.query(
      'UPDATE reto_c.solicitudes SET numero_ticket = $1 WHERE id = $2',
      [numero_ticket, newId]
    );

    // Insert initial historial record
    await pool.query(
      `INSERT INTO reto_c.historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario)
       VALUES ($1, NULL, 'Recibida', $2, 'Solicitud creada')`,
      [newId, solicitante]
    );

    const finalResult = await pool.query(
      `SELECT s.*, t.nombre AS tipo_nombre, a.nombre AS area_nombre
       FROM reto_c.solicitudes s
       LEFT JOIN reto_c.tipos_solicitud t ON s.tipo_solicitud_id = t.id
       LEFT JOIN reto_c.areas a ON s.area_solicitante_id = a.id
       WHERE s.id = $1`,
      [newId]
    );

    res.status(201).json(finalResult.rows[0]);
  } catch (err) {
    console.error('Error creating solicitud:', err);
    res.status(500).json({ error: 'Error creating solicitud', detail: err.message });
  }
});

// PATCH /api/solicitudes/:id/estado
router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, comentario, usuario } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'Missing required field: estado' });
    }

    const validEstados = ['Recibida', 'En revisión', 'Resuelta', 'Rechazada', 'Cancelada'];
    if (!validEstados.includes(estado)) {
      return res.status(400).json({
        error: `Invalid estado. Must be one of: ${validEstados.join(', ')}`,
      });
    }

    const current = await pool.query(
      'SELECT estado FROM reto_c.solicitudes WHERE id = $1',
      [id]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud not found' });
    }

    const estadoAnterior = current.rows[0].estado;

    await pool.query(
      'UPDATE reto_c.solicitudes SET estado = $1 WHERE id = $2',
      [estado, id]
    );

    await pool.query(
      `INSERT INTO reto_c.historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, comentario, usuario)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, estadoAnterior, estado, comentario || null, usuario || 'Sistema']
    );

    const updated = await pool.query(
      `SELECT s.*, t.nombre AS tipo_nombre, a.nombre AS area_nombre
       FROM reto_c.solicitudes s
       LEFT JOIN reto_c.tipos_solicitud t ON s.tipo_solicitud_id = t.id
       LEFT JOIN reto_c.areas a ON s.area_solicitante_id = a.id
       WHERE s.id = $1`,
      [id]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Error updating estado:', err);
    res.status(500).json({ error: 'Error updating estado', detail: err.message });
  }
});

module.exports = router;

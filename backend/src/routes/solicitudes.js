const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// --- Helpers ---

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URGENCIAS = ['Alta', 'Media', 'Baja'];

// FSM uses exact DB values (accented)
const EN_REVISION = 'En revisión';
const FSM_NEXT = {
  'Recibida': EN_REVISION,
  [EN_REVISION]: 'Resuelta',
};

function validateSolicitud(body) {
  const errors = {};
  if (!body.tipo_solicitud_id) errors.tipo_solicitud = 'Campo requerido';
  if (!body.titulo || !body.titulo.trim()) errors.titulo = 'Campo requerido';
  if (!body.descripcion || !body.descripcion.trim()) errors.descripcion = 'Campo requerido';
  if (!body.solicitante || !body.solicitante.trim()) errors.solicitante = 'Campo requerido';
  if (!body.email_solicitante || !body.email_solicitante.trim()) {
    errors.email_solicitante = 'Campo requerido';
  } else if (!EMAIL_RE.test(body.email_solicitante)) {
    errors.email_solicitante = 'Formato de email invalido';
  }
  if (!body.area_solicitante_id) errors.area_solicitante = 'Campo requerido';
  if (body.urgencia && !URGENCIAS.includes(body.urgencia)) {
    errors.urgencia = 'Valor invalido. Debe ser Alta, Media o Baja';
  }
  return Object.keys(errors).length ? errors : null;
}

async function generateTicket(client) {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `TK${yy}${mm}`;

  const result = await client.query(
    'SELECT COUNT(*) FROM reto_c.solicitudes WHERE numero_ticket LIKE $1',
    [`${prefix}-%`]
  );
  const seq = parseInt(result.rows[0].count) + 1;
  return `${prefix}-${String(seq).padStart(3, '0')}`;
}

// --- POST /api/solicitudes ---
router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.urgencia) body.urgencia = 'Baja';

    const errors = validateSolicitud(body);
    if (errors) {
      return res.status(422).json({ errors });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const ticket = await generateTicket(client);

      const insertResult = await client.query(
        `INSERT INTO reto_c.solicitudes
           (numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia,
            estado, solicitante, email_solicitante, area_solicitante_id)
         VALUES ($1,$2,$3,$4,$5,'Recibida',$6,$7,$8)
         RETURNING id, numero_ticket`,
        [
          ticket,
          body.tipo_solicitud_id,
          body.titulo.trim(),
          body.descripcion.trim(),
          body.urgencia,
          body.solicitante.trim(),
          body.email_solicitante.trim().toLowerCase(),
          body.area_solicitante_id,
        ]
      );

      const { id, numero_ticket } = insertResult.rows[0];

      await client.query(
        `INSERT INTO reto_c.historial_solicitudes
           (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario)
         VALUES ($1, NULL, 'Recibida', $2, 'Solicitud creada')`,
        [id, body.solicitante.trim()]
      );

      await client.query('COMMIT');
      res.status(201).json({ ticket: numero_ticket, numero_ticket, id });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// --- GET /api/solicitudes ---
router.get('/', async (req, res, next) => {
  try {
    const { tipo, urgencia, responsable } = req.query;

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
      conditions.push(`s.asignado_a ILIKE $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT
         s.id,
         s.numero_ticket,
         s.titulo,
         s.descripcion,
         s.urgencia,
         s.estado,
         s.solicitante,
         s.email_solicitante,
         s.asignado_a AS responsable,
         s.fecha_creacion,
         t.id   AS tipo_solicitud_id,
         t.nombre AS tipo_solicitud_nombre,
         a.id   AS area_solicitante_id,
         a.nombre AS area_solicitante_nombre,
         (s.urgencia = 'Alta' AND s.estado = 'Recibida'
          AND (NOW() - s.fecha_creacion) > INTERVAL '24 hours') AS stale_high
       FROM reto_c.solicitudes s
       JOIN reto_c.tipos_solicitud t ON t.id = s.tipo_solicitud_id
       JOIN reto_c.areas a ON a.id = s.area_solicitante_id
       ${where}
       ORDER BY
         CASE s.urgencia WHEN 'Alta' THEN 1 WHEN 'Media' THEN 2 ELSE 3 END,
         s.fecha_creacion DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// --- PATCH /api/solicitudes/:id/estado ---
router.patch('/:id/estado', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { responsable, comentario } = req.body;

    const current = await pool.query(
      'SELECT id, estado, solicitante FROM reto_c.solicitudes WHERE id = $1',
      [id]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const { estado: estadoActual } = current.rows[0];
    const nextEstado = FSM_NEXT[estadoActual];

    if (!nextEstado) {
      return res.status(422).json({
        error: `No se puede avanzar desde el estado "${estadoActual}". La solicitud ya esta en su estado final.`,
      });
    }

    if (nextEstado === EN_REVISION && (!responsable || !responsable.trim())) {
      return res.status(422).json({
        errors: { responsable: 'El responsable es requerido para pasar a En revision' },
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const updateFields = ['estado = $1'];
      const updateParams = [nextEstado];

      if (nextEstado === EN_REVISION) {
        updateParams.push(responsable.trim());
        updateFields.push(`asignado_a = $${updateParams.length}`);
      }

      if (nextEstado === 'Resuelta') {
        updateFields.push('fecha_resolucion = NOW()');
      }

      updateParams.push(id);
      await client.query(
        `UPDATE reto_c.solicitudes SET ${updateFields.join(', ')} WHERE id = $${updateParams.length}`,
        updateParams
      );

      await client.query(
        `INSERT INTO reto_c.historial_solicitudes
           (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          estadoActual,
          nextEstado,
          responsable ? responsable.trim() : current.rows[0].solicitante,
          comentario || `Cambio de estado: ${estadoActual} -> ${nextEstado}`,
        ]
      );

      await client.query('COMMIT');
      res.json({ id: parseInt(id), estado: nextEstado });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// --- GET /api/solicitudes/:id/historial ---
router.get('/:id/historial', async (req, res, next) => {
  try {
    const { id } = req.params;

    const check = await pool.query(
      'SELECT id, numero_ticket FROM reto_c.solicitudes WHERE id = $1',
      [id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const result = await pool.query(
      `SELECT
         h.id,
         h.solicitud_id,
         h.estado_anterior,
         h.estado_nuevo,
         h.usuario,
         h.comentario,
         h.fecha_cambio,
         s.numero_ticket
       FROM reto_c.historial_solicitudes h
       JOIN reto_c.solicitudes s ON s.id = h.solicitud_id
       WHERE h.solicitud_id = $1
       ORDER BY h.fecha_cambio ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

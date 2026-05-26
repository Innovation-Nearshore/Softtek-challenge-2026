'use strict';

const { query, getClient } = require('../config/database');

// ─── Valid enum values ────────────────────────────────────────────────────────
const VALID_URGENCY = ['Alta', 'Media', 'Baja'];
const VALID_STATUS  = ['Recibida', 'En revisión', 'Resuelta'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a unique ticket number: TKT-YYYYMMDD-XXXX */
function generateTicketNumber() {
  const now  = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${date}-${rand}`;
}

// ─── Areas ────────────────────────────────────────────────────────────────────

/**
 * GET /api/areas
 * List all areas from reto_c.areas
 */
async function listAreas(req, res, next) {
  try {
    const result = await query(
      `SELECT id, nombre, descripcion, email_contacto
       FROM   reto_c.areas
       ORDER  BY nombre ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

// ─── Tipos de solicitud ───────────────────────────────────────────────────────

/**
 * GET /api/tipos-solicitud
 * List all request types from reto_c.tipos_solicitud
 */
async function listTipos(req, res, next) {
  try {
    const result = await query(
      `SELECT id, codigo, nombre, descripcion, sla_horas, requiere_aprobacion
       FROM   reto_c.tipos_solicitud
       ORDER  BY nombre ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

// ─── Solicitudes ──────────────────────────────────────────────────────────────

/**
 * GET /api/requests
 * List all solicitudes with optional filters ?tipo_id= and ?urgencia=
 * Returns a joined view (with tipo name and area name) for the frontend.
 */
async function listRequests(req, res, next) {
  try {
    const conditions = [];
    const values     = [];
    let   idx        = 1;

    const { tipo_id, urgencia } = req.query;

    if (tipo_id && !isNaN(Number(tipo_id))) {
      conditions.push(`s.tipo_solicitud_id = $${idx++}`);
      values.push(Number(tipo_id));
    }

    if (urgencia && VALID_URGENCY.includes(urgencia)) {
      conditions.push(`s.urgencia = $${idx++}`);
      values.push(urgencia);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT s.id,
              s.numero_ticket,
              t.nombre            AS tipo,
              t.id                AS tipo_solicitud_id,
              s.titulo,
              s.descripcion,
              s.urgencia,
              s.estado,
              s.solicitante,
              s.email_solicitante,
              a.nombre            AS area,
              a.id                AS area_solicitante_id,
              s.fecha_creacion,
              s.fecha_resolucion
       FROM   reto_c.solicitudes        s
       JOIN   reto_c.tipos_solicitud    t ON t.id = s.tipo_solicitud_id
       JOIN   reto_c.areas              a ON a.id = s.area_solicitante_id
       ${where}
       ORDER  BY s.fecha_creacion DESC`,
      values
    );

    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/requests/:id
 * Get a single solicitud by id
 */
async function getRequest(req, res, next) {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT s.id,
              s.numero_ticket,
              t.nombre            AS tipo,
              t.id                AS tipo_solicitud_id,
              s.titulo,
              s.descripcion,
              s.urgencia,
              s.estado,
              s.solicitante,
              s.email_solicitante,
              a.nombre            AS area,
              a.id                AS area_solicitante_id,
              s.fecha_creacion,
              s.fecha_resolucion
       FROM   reto_c.solicitudes        s
       JOIN   reto_c.tipos_solicitud    t ON t.id = s.tipo_solicitud_id
       JOIN   reto_c.areas              a ON a.id = s.area_solicitante_id
       WHERE  s.id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/requests
 * Create a new solicitud.
 *
 * Expected body:
 *   tipo_solicitud_id   (integer)
 *   urgencia            ('Alta' | 'Media' | 'Baja')
 *   descripcion         (string, min 10 chars)
 *   solicitante         (string, min 3 chars)
 *   email_solicitante   (valid email)
 *   area_solicitante_id (integer)
 */
async function createRequest(req, res, next) {
  try {
    const {
      tipo_solicitud_id,
      urgencia,
      descripcion,
      solicitante,
      email_solicitante,
      area_solicitante_id,
    } = req.body;

    // ── Field-level validation ─────────────────────────────────────────────────
    const errors = [];

    if (!tipo_solicitud_id || isNaN(Number(tipo_solicitud_id))) {
      errors.push({ field: 'tipo_solicitud_id', message: 'El tipo de solicitud es obligatorio.' });
    }

    if (!urgencia || !VALID_URGENCY.includes(urgencia)) {
      errors.push({ field: 'urgencia', message: `La urgencia debe ser: ${VALID_URGENCY.join(', ')}.` });
    }

    if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length < 10) {
      errors.push({ field: 'descripcion', message: 'La descripción es obligatoria y debe tener al menos 10 caracteres.' });
    }

    if (!solicitante || typeof solicitante !== 'string' || solicitante.trim().length < 3) {
      errors.push({ field: 'solicitante', message: 'El nombre del solicitante es obligatorio (mínimo 3 caracteres).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_solicitante || !emailRegex.test(String(email_solicitante).trim())) {
      errors.push({ field: 'email_solicitante', message: 'Ingrese un correo electrónico válido.' });
    }

    if (!area_solicitante_id || isNaN(Number(area_solicitante_id))) {
      errors.push({ field: 'area_solicitante_id', message: 'El área es obligatoria.' });
    }

    if (errors.length > 0) {
      return res.status(422).json({ success: false, errors });
    }

    // ── Verify tipo exists ────────────────────────────────────────────────────
    const tipoResult = await query(
      `SELECT id, nombre FROM reto_c.tipos_solicitud WHERE id = $1`,
      [Number(tipo_solicitud_id)]
    );

    if (tipoResult.rowCount === 0) {
      return res.status(422).json({
        success: false,
        errors: [{ field: 'tipo_solicitud_id', message: 'El tipo de solicitud seleccionado no existe.' }],
      });
    }

    // ── Verify area exists ────────────────────────────────────────────────────
    const areaResult = await query(
      `SELECT id FROM reto_c.areas WHERE id = $1`,
      [Number(area_solicitante_id)]
    );

    if (areaResult.rowCount === 0) {
      return res.status(422).json({
        success: false,
        errors: [{ field: 'area_solicitante_id', message: 'El área seleccionada no existe.' }],
      });
    }

    const tipoNombre    = tipoResult.rows[0].nombre;
    const titulo        = `[${tipoNombre}] ${descripcion.trim().slice(0, 200)}`;
    const numero_ticket = generateTicketNumber();

    const result = await query(
      `INSERT INTO reto_c.solicitudes
         (numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia,
          estado, solicitante, email_solicitante, area_solicitante_id, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, 'Recibida', $6, $7, $8, NOW())
       RETURNING id, numero_ticket, tipo_solicitud_id, titulo, descripcion,
                 urgencia, estado, solicitante, email_solicitante,
                 area_solicitante_id, fecha_creacion`,
      [
        numero_ticket,
        Number(tipo_solicitud_id),
        titulo,
        descripcion.trim(),
        urgencia,
        solicitante.trim(),
        String(email_solicitante).trim().toLowerCase(),
        Number(area_solicitante_id),
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505' && err.constraint === 'solicitudes_numero_ticket_key') {
      return next({ status: 409, message: 'Error al generar ticket único. Intente nuevamente.' });
    }
    next(err);
  }
}

/**
 * PATCH /api/requests/:id/status
 * Update the estado of a solicitud and log the change in historial_solicitudes.
 * Body: { status: string, usuario?: string }
 */
async function updateStatus(req, res, next) {
  const client = await getClient();
  try {
    const { id }              = req.params;
    const { status, usuario } = req.body;

    if (!status || !VALID_STATUS.includes(status)) {
      return res.status(422).json({
        success: false,
        errors: [{ field: 'status', message: `El estado debe ser: ${VALID_STATUS.join(', ')}.` }],
      });
    }

    await client.query('BEGIN');

    // Lock and fetch current row
    const current = await client.query(
      `SELECT id, estado FROM reto_c.solicitudes WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (current.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });
    }

    const estadoAnterior = current.rows[0].estado;

    if (estadoAnterior === status) {
      await client.query('ROLLBACK');
      return res.status(200).json({
        success: true,
        message: 'El estado ya es el solicitado.',
        data: current.rows[0],
      });
    }

    // Update estado (and set fecha_resolucion when resolved)
    const updated = await client.query(
      `UPDATE reto_c.solicitudes
       SET    estado           = $1,
              fecha_resolucion = CASE WHEN $1 = 'Resuelta' THEN NOW() ELSE fecha_resolucion END
       WHERE  id = $2
       RETURNING id, numero_ticket, titulo, urgencia, estado,
                 solicitante, email_solicitante, tipo_solicitud_id,
                 area_solicitante_id, fecha_creacion, fecha_resolucion`,
      [status, id]
    );

    // Log change in historial_solicitudes
    await client.query(
      `INSERT INTO reto_c.historial_solicitudes
         (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [id, estadoAnterior, status, usuario || 'Sistema', null]
    );

    await client.query('COMMIT');

    res.json({ success: true, data: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

/**
 * DELETE /api/requests/:id
 * Delete a single solicitud.
 * historial_solicitudes rows are removed automatically via ON DELETE CASCADE.
 */
async function deleteRequest(req, res, next) {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM reto_c.solicitudes WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });
    }

    res.json({ success: true, message: `Solicitud #${id} eliminada correctamente.` });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/requests
 * Clear ALL solicitudes (historial cascades automatically).
 */
async function clearAllRequests(req, res, next) {
  try {
    const result = await query(`DELETE FROM reto_c.solicitudes RETURNING id`);
    res.json({
      success: true,
      message: `Se eliminaron ${result.rowCount} solicitudes.`,
      deleted: result.rowCount,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAreas,
  listTipos,
  listRequests,
  getRequest,
  createRequest,
  updateStatus,
  deleteRequest,
  clearAllRequests,
};

const db = require('../db/pool');

const VALID_TRANSITIONS = {
  Recibida: 'En revisión',
  'En revisión': 'Resuelta',
};

/**
 * List solicitudes with pagination. Joins area and tipo names.
 * Optionally filters by responsable (asignado_a) using ILIKE for case-insensitive partial match.
 */
async function getSolicitudes({ page = 1, limit = 50, responsable = null } = {}) {
  const offset = (page - 1) * limit;

  const params = [];
  let whereClause = '';
  if (responsable) {
    params.push(`%${responsable}%`);
    whereClause = `WHERE s.asignado_a ILIKE $${params.length}`;
  }

  const countResult = await db.query(
    `SELECT COUNT(*) FROM solicitudes s ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Add limit and offset after the where params
  params.push(limit);
  params.push(offset);

  const result = await db.query(
    `SELECT
       s.id,
       s.numero_ticket,
       s.titulo,
       s.descripcion,
       s.urgencia,
       s.estado,
       s.solicitante,
       s.email_solicitante,
       s.asignado_a,
       s.fecha_creacion,
       s.fecha_vencimiento,
       s.fecha_resolucion,
       s.solucion,
       s.calificacion,
       s.comentario_calificacion,
       ts.nombre  AS tipo_solicitud_nombre,
       ts.codigo  AS tipo_solicitud_codigo,
       as1.nombre AS area_solicitante_nombre,
       as2.nombre AS area_asignada_nombre,
       s.tipo_solicitud_id,
       s.area_solicitante_id,
       s.area_asignada_id
     FROM solicitudes s
     JOIN tipos_solicitud ts ON ts.id = s.tipo_solicitud_id
     JOIN areas as1           ON as1.id = s.area_solicitante_id
     LEFT JOIN areas as2      ON as2.id = s.area_asignada_id
     ${whereClause}
     ORDER BY s.fecha_creacion DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { data: result.rows, total, page, limit };
}

/**
 * Get a single solicitud by id.
 */
async function getSolicitudById(id) {
  const result = await db.query(
    `SELECT * FROM solicitudes WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Create a new solicitud inside a transaction.
 * Auto-sets estado = 'Recibida' and logs historial.
 */
async function createSolicitud(data) {
  const {
    tipo_solicitud_id,
    titulo,
    descripcion,
    urgencia,
    solicitante,
    email_solicitante,
    area_solicitante_id,
    area_asignada_id,
  } = data;

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Generate ticket number: TK-YYMM-<sequence>
    const now = new Date();
    const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const countRes = await client.query(`SELECT COUNT(*) FROM solicitudes`);
    const seq = String(parseInt(countRes.rows[0].count, 10) + 1).padStart(3, '0');
    const numero_ticket = `TK-${yymm}-${seq}`;

    const insertRes = await client.query(
      `INSERT INTO solicitudes
         (numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado,
          solicitante, email_solicitante, area_solicitante_id, area_asignada_id)
       VALUES ($1, $2, $3, $4, $5, 'Recibida', $6, $7, $8, $9)
       RETURNING *`,
      [
        numero_ticket,
        tipo_solicitud_id,
        titulo,
        descripcion,
        urgencia,
        solicitante,
        email_solicitante,
        area_solicitante_id,
        area_asignada_id || null,
      ]
    );

    const solicitud = insertRes.rows[0];

    await client.query(
      `INSERT INTO historial_solicitudes
         (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
       VALUES ($1, NULL, 'Recibida', 'Sistema', 'Solicitud creada', NOW())`,
      [solicitud.id]
    );

    await client.query('COMMIT');
    return solicitud;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update estado with transition validation inside a transaction.
 * When transitioning to "En revisión", responsable (asignado_a) is required.
 */
async function updateEstado(id, nuevoEstado, responsable) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const current = await client.query(
      `SELECT estado, asignado_a FROM solicitudes WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (current.rows.length === 0) {
      const err = new Error('Solicitud no encontrada');
      err.status = 404;
      throw err;
    }

    const estadoActual = current.rows[0].estado;
    const transicionPermitida = VALID_TRANSITIONS[estadoActual];

    if (!transicionPermitida) {
      const err = new Error(
        `La solicitud en estado "${estadoActual}" no admite más cambios de estado`
      );
      err.status = 400;
      throw err;
    }

    if (transicionPermitida !== nuevoEstado) {
      const err = new Error(
        `Transición inválida: no se puede pasar de "${estadoActual}" a "${nuevoEstado}". La única transición permitida es a "${transicionPermitida}"`
      );
      err.status = 400;
      throw err;
    }

    // Require responsable when transitioning to "En revisión"
    if (nuevoEstado === 'En revisión' && !responsable) {
      const err = new Error(
        'Se debe asignar un responsable al pasar a "En revisión"'
      );
      err.status = 400;
      throw err;
    }

    // Build update query — set asignado_a only when provided
    let updateRes;
    if (responsable) {
      updateRes = await client.query(
        `UPDATE solicitudes SET estado = $1, asignado_a = $2 WHERE id = $3 RETURNING *`,
        [nuevoEstado, responsable, id]
      );
    } else {
      updateRes = await client.query(
        `UPDATE solicitudes SET estado = $1 WHERE id = $2 RETURNING *`,
        [nuevoEstado, id]
      );
    }

    const usuario = responsable || 'Sistema';
    const comentario = responsable
      ? `Estado cambiado de "${estadoActual}" a "${nuevoEstado}". Responsable asignado: ${responsable}`
      : `Estado cambiado de "${estadoActual}" a "${nuevoEstado}"`;

    await client.query(
      `INSERT INTO historial_solicitudes
         (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [id, estadoActual, nuevoEstado, usuario, comentario]
    );

    await client.query('COMMIT');
    return updateRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get historial for a solicitud.
 */
async function getHistorial(solicitudId) {
  const result = await db.query(
    `SELECT id, solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio
     FROM historial_solicitudes
     WHERE solicitud_id = $1
     ORDER BY fecha_cambio DESC`,
    [solicitudId]
  );
  return result.rows;
}

module.exports = {
  getSolicitudes,
  getSolicitudById,
  createSolicitud,
  updateEstado,
  getHistorial,
};

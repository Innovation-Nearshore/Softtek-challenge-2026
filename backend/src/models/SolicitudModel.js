const db = require('../config/database');

class SolicitudModel {
  /**
   * Obtener todas las solicitudes con filtros opcionales.
   * Alias de campos para compatibilidad con el frontend.
   */
  static async getAllSolicitudes(filters = {}) {
    let query = `
      SELECT
        s.id,
        s.numero_ticket,
        s.titulo,
        s.descripcion,
        s.urgencia,
        s.estado        AS status,
        s.estado        AS estado,
        s.solicitante,
        s.email_solicitante,
        s.fecha_creacion  AS created_at,
        s.fecha_vencimiento,
        s.fecha_resolucion,
        t.nombre        AS tipo,
        a.nombre        AS area
      FROM solicitudes s
      LEFT JOIN tipos_solicitud t ON s.tipo_solicitud_id = t.id
      LEFT JOIN areas           a ON s.area_solicitante_id = a.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (filters.tipo) {
      query += ` AND t.nombre ILIKE $${idx}`;
      params.push(filters.tipo);
      idx++;
    }
    if (filters.urgencia) {
      query += ` AND s.urgencia = $${idx}`;
      params.push(filters.urgencia);
      idx++;
    }
    if (filters.estado) {
      query += ` AND s.estado = $${idx}`;
      params.push(filters.estado);
      idx++;
    }
    if (filters.area_id) {
      query += ` AND s.area_solicitante_id = $${idx}`;
      params.push(filters.area_id);
      idx++;
    }

    query += ` ORDER BY s.fecha_creacion DESC`;

    try {
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error en getAllSolicitudes:', error.message);
      throw error;
    }
  }

  /**
   * Obtener una solicitud por ID.
   */
  static async getSolicitudById(id) {
    const query = `
      SELECT
        s.id,
        s.numero_ticket,
        s.titulo,
        s.descripcion,
        s.urgencia,
        s.estado        AS status,
        s.estado        AS estado,
        s.solicitante,
        s.email_solicitante,
        s.fecha_creacion  AS created_at,
        s.fecha_vencimiento,
        s.fecha_resolucion,
        s.solucion,
        t.nombre        AS tipo,
        a.nombre        AS area
      FROM solicitudes s
      LEFT JOIN tipos_solicitud t ON s.tipo_solicitud_id = t.id
      LEFT JOIN areas           a ON s.area_solicitante_id = a.id
      WHERE s.id = $1
    `;
    try {
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error en getSolicitudById:', error.message);
      throw error;
    }
  }

  /**
   * Crear nueva solicitud.
   * Acepta campos de texto (tipo, area) y resuelve los IDs internamente.
   */
  static async createSolicitud(data) {
    const { tipo, urgencia, descripcion, solicitante, area, email_solicitante } = data;

    // Resolver tipo_solicitud_id por nombre
    const tipoResult = await db.query(
      `SELECT id FROM tipos_solicitud WHERE nombre ILIKE $1 LIMIT 1`,
      [tipo]
    );
    let tipoId = tipoResult.rows[0]?.id;

    // Si no se encontró, usar el primero disponible o crear un tipo genérico
    if (!tipoId) {
      const fallback = await db.query(`SELECT id FROM tipos_solicitud LIMIT 1`);
      tipoId = fallback.rows[0]?.id;
    }

    // Resolver area_solicitante_id por nombre
    const areaResult = await db.query(
      `SELECT id FROM areas WHERE nombre ILIKE $1 LIMIT 1`,
      [area]
    );
    let areaId = areaResult.rows[0]?.id;

    if (!areaId) {
      const fallback = await db.query(`SELECT id FROM areas LIMIT 1`);
      areaId = fallback.rows[0]?.id;
    }

    const numeroTicket = `TK-${Date.now()}`;
    const fechaVencimiento = new Date();
    fechaVencimiento.setHours(fechaVencimiento.getHours() + 48);

    const insertQuery = `
      INSERT INTO solicitudes (
        numero_ticket, tipo_solicitud_id, titulo, descripcion,
        urgencia, estado, solicitante, email_solicitante,
        area_solicitante_id, fecha_creacion, fecha_vencimiento
      ) VALUES ($1, $2, $3, $4, $5, 'Recibida', $6, $7, $8, NOW(), $9)
      RETURNING
        id, numero_ticket, titulo, descripcion, urgencia,
        estado AS status, estado, solicitante, email_solicitante,
        fecha_creacion AS created_at
    `;

    const params = [
      numeroTicket,
      tipoId,
      descripcion,        // usamos descripcion como título también
      descripcion,
      urgencia,
      solicitante,
      email_solicitante || 'sin-email@empresa.com',
      areaId,
      fechaVencimiento,
    ];

    try {
      const result = await db.query(insertQuery, params);
      const solicitud = result.rows[0];

      // Registrar en historial
      await this.addHistorialEntry(solicitud.id, null, 'Recibida', 'Sistema', 'Solicitud creada');

      return solicitud;
    } catch (error) {
      console.error('Error en createSolicitud:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar estado de una solicitud (con transacción).
   */
  static async updateSolicitudStatus(id, nuevoEstado, usuario = 'Sistema', comentario = '') {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET search_path TO reto_c,public');

      // Obtener estado anterior
      const currentRes = await client.query(
        'SELECT estado FROM solicitudes WHERE id = $1',
        [id]
      );
      if (currentRes.rows.length === 0) throw new Error('Solicitud no encontrada');
      const estadoAnterior = currentRes.rows[0].estado;

      // Actualizar solicitud (sin columna updated_at que no existe)
      const updateRes = await client.query(
        `UPDATE solicitudes
         SET estado = $1
         WHERE id = $2
         RETURNING id, numero_ticket, titulo, descripcion, urgencia,
                   estado AS status, estado, solicitante, fecha_creacion AS created_at`,
        [nuevoEstado, id]
      );

      // Registrar en historial
      await client.query(
        `INSERT INTO historial_solicitudes
           (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [id, estadoAnterior, nuevoEstado, usuario, comentario]
      );

      await client.query('COMMIT');
      return updateRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error en updateSolicitudStatus:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtener historial de cambios.
   * Alias de campos para compatibilidad con el frontend.
   */
  static async getHistorialSolicitud(solicitudId) {
    const query = `
      SELECT
        id,
        solicitud_id,
        estado_anterior AS old_status,
        estado_nuevo    AS new_status,
        usuario,
        comentario,
        fecha_cambio    AS changed_at
      FROM historial_solicitudes
      WHERE solicitud_id = $1
      ORDER BY fecha_cambio ASC
    `;
    try {
      const result = await db.query(query, [solicitudId]);
      return result.rows;
    } catch (error) {
      console.error('Error en getHistorialSolicitud:', error.message);
      throw error;
    }
  }

  /**
   * Insertar entrada en historial (helper interno).
   */
  static async addHistorialEntry(solicitudId, estadoAnterior, estadoNuevo, usuario, comentario) {
    const query = `
      INSERT INTO historial_solicitudes
        (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario, fecha_cambio)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `;
    try {
      await db.query(query, [solicitudId, estadoAnterior, estadoNuevo, usuario, comentario]);
    } catch (error) {
      console.error('Error en addHistorialEntry:', error.message);
      throw error;
    }
  }

  /**
   * Métricas del dashboard.
   */
  static async getMetricas() {
    const query = `
      SELECT
        COUNT(*)                                              AS total,
        COUNT(CASE WHEN estado = 'Recibida'    THEN 1 END)  AS recibidas,
        COUNT(CASE WHEN estado = 'En revisión' THEN 1 END)  AS en_revision,
        COUNT(CASE WHEN estado = 'Resuelta'    THEN 1 END)  AS resueltas,
        COUNT(CASE WHEN urgencia = 'Alta'      THEN 1 END)  AS alta,
        COUNT(CASE WHEN urgencia = 'Media'     THEN 1 END)  AS media,
        COUNT(CASE WHEN urgencia = 'Baja'      THEN 1 END)  AS baja
      FROM solicitudes
    `;
    try {
      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error en getMetricas:', error.message);
      throw error;
    }
  }

  /**
   * Obtener tipos de solicitud.
   */
  static async getTiposSolicitud() {
    try {
      const result = await db.query(
        `SELECT id, codigo, nombre FROM tipos_solicitud ORDER BY nombre`
      );
      return result.rows;
    } catch (error) {
      console.error('Error en getTiposSolicitud:', error.message);
      throw error;
    }
  }

  /**
   * Obtener áreas.
   */
  static async getAreas() {
    try {
      const result = await db.query(
        `SELECT id, nombre FROM areas ORDER BY nombre`
      );
      return result.rows;
    } catch (error) {
      console.error('Error en getAreas:', error.message);
      throw error;
    }
  }
}

module.exports = SolicitudModel;

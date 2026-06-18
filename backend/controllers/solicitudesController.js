const pool = require('../db/connection');

const SCHEMA = process.env.DB_SCHEMA || 'reto_c';

// Orden de estados permitidos para validar transiciones
const ESTADOS_ORDEN = ['Recibida', 'En revisión', 'Resuelta'];

// Genera un número de ticket único con prefijo TK y timestamp
const generarNumeroTicket = () => `TK-${Date.now()}`;

// Valida que la transición de estado sea hacia el siguiente inmediato (sin retroceso ni salto)
const validarTransicionEstado = (estadoActual, estadoNuevo) => {
  const indiceActual = ESTADOS_ORDEN.indexOf(estadoActual);
  const indiceNuevo = ESTADOS_ORDEN.indexOf(estadoNuevo);
  if (indiceActual === -1 || indiceNuevo === -1) return false;
  return indiceNuevo === indiceActual + 1;
};

// Valida que los campos requeridos estén presentes y dentro de límites
const validarCamposSolicitud = ({ tipo_solicitud_id, titulo, descripcion, urgencia, solicitante, email_solicitante, area_solicitante_id }) => {
  if (!tipo_solicitud_id || !titulo || !descripcion || !urgencia || !solicitante || !email_solicitante || !area_solicitante_id) {
    return 'Todos los campos son obligatorios.';
  }
  if (titulo.length > 150) return 'El título no puede superar los 150 caracteres.';
  if (descripcion.length > 1000) return 'La descripción no puede superar los 1000 caracteres.';
  if (solicitante.length > 100) return 'El nombre del solicitante no puede superar los 100 caracteres.';
  if (email_solicitante.length > 150) return 'El email no puede superar los 150 caracteres.';
  if (!['Alta', 'Media', 'Baja'].includes(urgencia)) return 'La urgencia debe ser Alta, Media o Baja.';
  return null;
};

// Query base reutilizable para obtener solicitudes con JOINs
const buildSolicitudQuery = (whereClause = '') => `
  SELECT
    s.id,
    s.numero_ticket,
    s.tipo_solicitud_id,
    s.area_solicitante_id,
    s.titulo,
    s.descripcion,
    s.urgencia,
    s.estado,
    s.solicitante,
    s.email_solicitante,
    s.area_asignada_id,
    s.asignado_a,
    s.fecha_creacion,
    s.fecha_vencimiento,
    s.fecha_resolucion,
    s.solucion,
    s.calificacion,
    ts.nombre AS tipo_solicitud,
    a.nombre AS area_solicitante
  FROM ${SCHEMA}.solicitudes s
  JOIN ${SCHEMA}.tipos_solicitud ts ON s.tipo_solicitud_id = ts.id
  JOIN ${SCHEMA}.areas a ON s.area_solicitante_id = a.id
  ${whereClause}
`;

// GET /api/solicitudes — Lista todas las solicitudes; acepta filtros ?tipo=&urgencia=&solicitante=&email=
const getSolicitudes = async (req, res) => {
  const { tipo, urgencia, solicitante, email } = req.query;

  // Construcción dinámica de filtros opcionales
  const condiciones = [];
  const valores = [];

  if (tipo) {
    valores.push(tipo);
    // Filtra por nombre del tipo de solicitud (valor enviado desde el frontend)
    condiciones.push(`ts.nombre = $${valores.length}`);
  }

  if (urgencia) {
    valores.push(urgencia);
    condiciones.push(`s.urgencia = $${valores.length}`);
  }

  if (solicitante) {
    valores.push(solicitante);
    condiciones.push(`s.solicitante = $${valores.length}`);
  }

  if (email) {
    valores.push(email);
    condiciones.push(`s.email_solicitante = $${valores.length}`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const query = buildSolicitudQuery(whereClause) + ' ORDER BY s.fecha_creacion DESC';

  try {
    const resultado = await pool.query(query, valores);
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error.message);
    res.status(500).json({ error: 'Error interno al obtener solicitudes.' });
  }
};

// GET /api/solicitudes/:id — Obtiene una solicitud por ID
const getSolicitudById = async (req, res) => {
  const { id } = req.params;

  const query = buildSolicitudQuery(`WHERE s.id = $1`);

  try {
    const resultado = await pool.query(query, [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al obtener solicitud por ID:', error.message);
    res.status(500).json({ error: 'Error interno al obtener la solicitud.' });
  }
};

// POST /api/solicitudes — Crea una nueva solicitud con estado inicial "Recibida"
const crearSolicitud = async (req, res) => {
  const { tipo_solicitud_id, titulo, descripcion, urgencia, solicitante, email_solicitante, area_solicitante_id } = req.body;

  const errorValidacion = validarCamposSolicitud(req.body);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  const numero_ticket = generarNumeroTicket();
  const estado = 'Recibida';

  const query = `
    INSERT INTO ${SCHEMA}.solicitudes
      (numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado, solicitante, email_solicitante, area_solicitante_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
  `;

  try {
    const resultado = await pool.query(query, [
      numero_ticket, tipo_solicitud_id, titulo, descripcion,
      urgencia, estado, solicitante, email_solicitante, area_solicitante_id
    ]);

    // Devolver la solicitud completa con JOINs para consistencia con el frontend
    const newId = resultado.rows[0].id;
    const fullQuery = buildSolicitudQuery(`WHERE s.id = $1`);
    const full = await pool.query(fullQuery, [newId]);

    res.status(201).json(full.rows[0]);
  } catch (error) {
    console.error('Error al crear solicitud:', error.message);
    res.status(500).json({ error: 'Error interno al crear la solicitud.' });
  }
};

// PUT /api/solicitudes/:id/estado — Cambia el estado con validación y registro en historial
// Se ejecuta dentro de una transacción para garantizar consistencia entre ambas tablas
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado: estadoNuevo, comentario } = req.body;

  if (!estadoNuevo) {
    return res.status(400).json({ error: 'El nuevo estado es requerido.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Obtener el estado actual y solicitante antes de actualizar
    const resultadoActual = await client.query(
      `SELECT estado, solicitante FROM ${SCHEMA}.solicitudes WHERE id = $1`,
      [id]
    );

    if (resultadoActual.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Solicitud no encontrada.' });
    }

    const estadoActual = resultadoActual.rows[0].estado;
    const solicitante = resultadoActual.rows[0].solicitante;

    // Validar que la transición sea permitida (no retroceder, no saltear estado)
    if (!validarTransicionEstado(estadoActual, estadoNuevo)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Transición de estado no válida: "${estadoActual}" → "${estadoNuevo}".`
      });
    }

    // Actualizar el estado en la solicitud
    await client.query(
      `UPDATE ${SCHEMA}.solicitudes SET estado = $1 WHERE id = $2`,
      [estadoNuevo, id]
    );

    // Registrar el cambio en historial dentro de la misma transacción
    await client.query(
      `INSERT INTO ${SCHEMA}.historial_solicitudes (solicitud_id, estado_anterior, estado_nuevo, usuario, comentario)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, estadoActual, estadoNuevo, solicitante, comentario || null]
    );

    await client.query('COMMIT');

    // Devolver la solicitud actualizada completa con JOINs
    const fullQuery = buildSolicitudQuery(`WHERE s.id = $1`);
    const full = await pool.query(fullQuery, [id]);

    res.json(full.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al cambiar estado:', error.message);
    res.status(500).json({ error: 'Error interno al cambiar el estado.' });
  } finally {
    client.release();
  }
};

module.exports = { getSolicitudes, getSolicitudById, crearSolicitud, cambiarEstado };

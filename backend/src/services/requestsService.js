const db = require('../db');

const SELECT_REQUESTS_BASE = `
  SELECT s.id, s.numero_ticket, s.titulo, s.descripcion, s.urgencia, s.estado,
    s.solicitante, s.email_solicitante, s.fecha_creacion,
    t.nombre AS tipo_solicitud, a.nombre AS area_solicitante
  FROM reto_c.solicitudes s
  JOIN reto_c.tipos_solicitud t ON t.id = s.tipo_solicitud_id
  JOIN reto_c.areas a ON a.id = s.area_solicitante_id
`;

const ORDER_BY = `ORDER BY s.fecha_creacion DESC`;
const SELECT_AREAS = `SELECT id, nombre FROM reto_c.areas ORDER BY nombre`;
const SELECT_TIPOS = `SELECT id, nombre FROM reto_c.tipos_solicitud ORDER BY nombre`;

const INSERT_REQUEST = `
  INSERT INTO reto_c.solicitudes
    (numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado, solicitante, email_solicitante, area_solicitante_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING id, numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado, solicitante, email_solicitante, area_solicitante_id, fecha_creacion
`;

const UPDATE_STATUS = `UPDATE reto_c.solicitudes SET estado = $1 WHERE id = $2 RETURNING id, estado`;

const generateTicketNumber = () => `TCK-${Date.now()}`;
const VALID_URGENCIAS = ['Alta', 'Media', 'Baja'];

const buildWhereClause = (status, urgencia) => {
  const conditions = [];
  if (status === 'pendientes') conditions.push("s.estado = 'En revisión'");
  if (urgencia && VALID_URGENCIAS.includes(urgencia)) conditions.push(`s.urgencia = '${urgencia}'`);
  return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
};

const getAllRequests = async (status, urgencia) => {
  const where = buildWhereClause(status, urgencia);
  const sql = `${SELECT_REQUESTS_BASE} ${where} ${ORDER_BY}`;
  const result = await db.query(sql);
  return result.rows;
};

const createRequest = async ({ tipo_solicitud_id, titulo, descripcion, urgencia, solicitante, email_solicitante, area_solicitante_id }) => {
  const numero_ticket = generateTicketNumber();
  const estado = 'Recibida';
  const params = [numero_ticket, tipo_solicitud_id, titulo, descripcion, urgencia, estado, solicitante, email_solicitante, area_solicitante_id];
  const result = await db.query(INSERT_REQUEST, params);
  return result.rows[0];
};

const updateRequestStatus = async (id, estado) => {
  const result = await db.query(UPDATE_STATUS, [estado, id]);
  return result.rows[0] || null;
};

const getAllAreas = async () => { const result = await db.query(SELECT_AREAS); return result.rows; };
const getAllTiposSolicitud = async () => { const result = await db.query(SELECT_TIPOS); return result.rows; };

module.exports = { getAllRequests, createRequest, updateRequestStatus, getAllAreas, getAllTiposSolicitud };
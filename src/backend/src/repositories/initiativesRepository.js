import { query } from '../config/database.js';
import env from '../config/env.js';

const SCHEMA = env.db.schema;
const TABLE = `${SCHEMA}.iniciativas`;

/**
 * SELECT fragment that maps Spanish DB columns to English API field names.
 * Acts as an anti-corruption layer between the DB schema and the application.
 */
const SELECT_COLS = `
  id,
  nombre        AS name,
  responsable   AS responsible,
  estado        AS status,
  fecha_limite  AS deadline,
  prioridad     AS priority,
  descripcion   AS description,
  fecha_creacion       AS created_at,
  fecha_actualizacion  AS updated_at
`;

export const findAll = async ({ status, limit = 100, offset = 0 } = {}) => {
  let text = `SELECT ${SELECT_COLS} FROM ${TABLE}`;
  const params = [];

  if (status) {
    params.push(status);
    text += ` WHERE estado = $${params.length}`;
  }

  text += ` ORDER BY fecha_creacion DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await query(text, params);
  return result.rows;
};

export const findById = async (id) => {
  const result = await query(
    `SELECT ${SELECT_COLS} FROM ${TABLE} WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

export const create = async ({ name, responsible, status, deadline, priority, description }) => {
  const text = `
    INSERT INTO ${TABLE} (nombre, responsable, estado, fecha_limite, prioridad, descripcion)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING ${SELECT_COLS}
  `;
  const params = [name, responsible, status, deadline, priority, description ?? null];
  const result = await query(text, params);
  return result.rows[0];
};

export const update = async (id, { name, responsible, status, deadline, priority, description }) => {
  const text = `
    UPDATE ${TABLE}
    SET nombre = $1,
        responsable = $2,
        estado = $3,
        fecha_limite = $4,
        prioridad = $5,
        descripcion = $6,
        fecha_actualizacion = NOW()
    WHERE id = $7
    RETURNING ${SELECT_COLS}
  `;
  const params = [name, responsible, status, deadline, priority, description ?? null, id];
  const result = await query(text, params);
  return result.rows[0] || null;
};

export const remove = async (id) => {
  const result = await query(
    `DELETE FROM ${TABLE} WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0] || null;
};

export const getStatusCounts = async () => {
  const text = `
    SELECT estado AS status, COUNT(*)::int AS count
    FROM ${TABLE}
    GROUP BY estado
  `;
  const result = await query(text);
  return result.rows;
};

export const getPriorityCounts = async () => {
  const text = `
    SELECT prioridad AS priority, COUNT(*)::int AS count
    FROM ${TABLE}
    GROUP BY prioridad
  `;
  const result = await query(text);
  return result.rows;
};

export default { findAll, findById, create, update, remove, getStatusCounts, getPriorityCounts };

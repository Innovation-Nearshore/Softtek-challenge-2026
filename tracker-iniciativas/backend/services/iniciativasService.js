const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ai_challenge',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
});

const SCHEMA = 'reto_a';
const TABLE = 'iniciativas';

/** Fetch all iniciativas ordered by id */
const fetchAll = async () => {
  const result = await pool.query(
    `SELECT * FROM ${SCHEMA}.${TABLE} ORDER BY id ASC`
  );
  return result.rows;
};

/** Fetch iniciativas filtered by estado */
const fetchByEstado = async (estado) => {
  const result = await pool.query(
    `SELECT * FROM ${SCHEMA}.${TABLE} WHERE estado = $1 ORDER BY id ASC`,
    [estado]
  );
  return result.rows;
};

/** Fetch iniciativas filtered by prioridad */
const fetchByPrioridad = async (prioridad) => {
  const result = await pool.query(
    `SELECT * FROM ${SCHEMA}.${TABLE} WHERE prioridad = $1 ORDER BY id ASC`,
    [prioridad]
  );
  return result.rows;
};

/** Fetch iniciativas with dynamic estado and/or prioridad filters */
const fetchByFilters = async (estado, prioridad) => {
  let query = `SELECT * FROM ${SCHEMA}.${TABLE} WHERE 1=1`;
  const params = [];

  if (estado) {
    query += ` AND estado = $${params.length + 1}`;
    params.push(estado);
  }
  if (prioridad) {
    query += ` AND prioridad = $${params.length + 1}`;
    params.push(prioridad);
  }

  query += ' ORDER BY id ASC';
  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Fetch iniciativas whose fecha_limite falls within the next `days` calendar days
 * (from today 00:00:00 up to and including today + days 23:59:59, server-local time).
 * Excludes already-completed initiatives.
 * Results are ordered by fecha_limite ASC (most urgent first).
 *
 * @param {number} days - Look-ahead window in days (default: 7)
 */
const fetchProximosVencimientos = async (days = 7) => {
  const result = await pool.query(
    `SELECT *
     FROM ${SCHEMA}.${TABLE}
     WHERE fecha_limite >= CURRENT_DATE
       AND fecha_limite <= CURRENT_DATE + INTERVAL '${Number(days)} days'
       AND estado <> 'Completado'
     ORDER BY fecha_limite ASC`,
  );
  return result.rows;
};

/** Insert a new iniciativa and return the created record */
const createOne = async (data) => {
  const { nombre, responsable, estado, fecha_limite, prioridad, descripcion } = data;
  const result = await pool.query(
    `INSERT INTO ${SCHEMA}.${TABLE}
       (nombre, responsable, estado, fecha_limite, prioridad, descripcion)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [nombre, responsable, estado, fecha_limite, prioridad, descripcion]
  );
  return result.rows[0];
};

/** Update an existing iniciativa by id and return the updated record */
const updateOne = async (id, data) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(data).forEach((key) => {
    fields.push(`${key} = $${paramCount}`);
    values.push(data[key]);
    paramCount++;
  });

  values.push(id);
  const query = `UPDATE ${SCHEMA}.${TABLE}
                 SET ${fields.join(', ')}
                 WHERE id = $${paramCount}
                 RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  fetchAll,
  fetchByEstado,
  fetchByPrioridad,
  fetchByFilters,
  fetchProximosVencimientos,
  createOne,
  updateOne,
};

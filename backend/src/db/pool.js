require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Set search_path to reto_a schema on every new connection
// The schema name is double-quoted to prevent SQL injection from the env var value.
pool.on('connect', (client) => {
  const schema = process.env.DB_SCHEMA;
  client.query(`SET search_path TO "${schema}"`);
  console.log(`[DB] New client connected — search_path set to "${schema}"`);
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
  process.exit(-1);
});

// Verify connectivity at startup
pool.query('SELECT NOW()')
  .then(() => console.log('[DB] Connection to PostgreSQL established successfully.'))
  .catch((err) => {
    console.error('[DB] Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  });

module.exports = pool;

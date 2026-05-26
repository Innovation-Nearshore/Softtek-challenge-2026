const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'ai_challenge',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin123',
  // Use search_path to default all queries to reto_c schema
  options: `-c search_path=reto_c`,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database (schema: reto_c)');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client:', err.message);
  process.exit(-1);
});

/**
 * Execute a parameterised query against the pool.
 * @param {string} text   - SQL query string
 * @param {Array}  params - Bound parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Obtain a dedicated client from the pool (for transactions).
 * Remember to call client.release() when done.
 */
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'ai_challenge',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const schema = () => process.env.DB_SCHEMA || 'reto_c';

/**
 * Execute a query, always setting search_path to the configured schema.
 */
async function query(text, params) {
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO ${schema()}`);
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Get a raw client for manual transaction control.
 * Caller must call client.release() when done.
 */
async function getClient() {
  const client = await pool.connect();
  await client.query(`SET search_path TO ${schema()}`);
  return client;
}

module.exports = { query, getClient };

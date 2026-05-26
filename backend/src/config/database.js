const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ai_challenge',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Set search_path to reto_c schema
pool.on('connect', (client) => {
  client.query('SET search_path TO reto_c,public', (err) => {
    if (err) {
      console.error('Error setting search_path:', err);
    }
  });
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test connection on startup
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful. Current time:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
    return false;
  }
};

// Export pool and test function
module.exports = {
  pool,
  testConnection,
  query: (text, params) => pool.query(text, params),
};

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin123',
});

const SCHEMA = process.env.DB_SCHEMA || 'reto_c';

// Set search_path on every new connection
pool.on('connect', (client) => {
  client.query(`SET search_path TO ${SCHEMA}`);
});

module.exports = { pool, SCHEMA };

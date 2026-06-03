'use strict';

/**
 * Database configuration module (Single Responsibility: owns DB connection settings).
 * Reads environment variables and exports a pg.Pool instance.
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'reto',
  user: process.env.DB_USER || 'softtek',
  password: process.env.DB_PASSWORD || 'Admin123',
});

// Enforce schema for every acquired connection (Dependency Inversion: schema isolated here)
pool.on('connect', (client) => {
  client.query('SET search_path TO reto_b');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
});

module.exports = pool;

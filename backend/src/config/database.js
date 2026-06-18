'use strict';

const { Pool } = require('pg');
const config = require('./index');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  // Set default search_path so all queries run in the correct schema
  options: `-c search_path=${config.db.schema},public`,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌  Error connecting to PostgreSQL:', err.message);
    process.exit(1);
  }
  console.log(`✅  Connected to PostgreSQL — database: ${config.db.name}, schema: ${config.db.schema}`);
  release();
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
  process.exit(1);
});

module.exports = pool;

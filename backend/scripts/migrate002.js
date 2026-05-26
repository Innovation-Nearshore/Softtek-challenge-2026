const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Admin123',
  database: 'ai_challenge',
});

const sqlPath = path.join(__dirname, '../src/config/migrations/002_create_request_status_history.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

pool.query(sql)
  .then(() => {
    console.log('✅ Migration 002 applied successfully: request_status_history table created');
    pool.end();
  })
  .catch((err) => {
    console.error('❌ Migration 002 failed:', err.message);
    pool.end();
    process.exit(1);
  });

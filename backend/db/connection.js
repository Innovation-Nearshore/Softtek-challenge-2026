const { Pool } = require('pg');
require('dotenv').config();

// Pool de conexiones reutilizable para toda la aplicación
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;

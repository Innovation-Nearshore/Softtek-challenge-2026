const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'postgres',
  // Belt-and-suspenders: set search_path at protocol level
  options: '-c search_path=reto_a,public',
});

// Also enforce search_path via SQL on every new physical connection
pool.on('connect', (client) => {
  client.query('SET search_path TO reto_a, public', (err) => {
    if (err) {
      console.error('Error al configurar search_path:', err.message);
    } else {
      console.log('Conexión establecida con PostgreSQL (search_path: reto_a, public)');
    }
  });
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

module.exports = pool;

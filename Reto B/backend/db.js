/* ============================================================
   DB.JS — Módulo de conexión a PostgreSQL (Pool)
   Web App de Métricas — reto_b
   ============================================================ */

'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD,
  // Configuración del pool
  max:              10,   // máximo de conexiones simultáneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Verificar conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error al conectar con PostgreSQL:', err.message);
  } else {
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');
    release();
  }
});

// Función de consulta simplificada
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[DB] Query ejecutada en ${duration}ms — filas: ${result.rowCount}`);
    return result;
  } catch (err) {
    console.error('[DB] Error en query:', err.message);
    console.error('[DB] SQL:', text);
    throw err;
  }
}

module.exports = { pool, query };

'use strict';

const { pool } = require('./database');

const SQL_INIT = `
  CREATE SCHEMA IF NOT EXISTS reto_a;

  CREATE TABLE IF NOT EXISTS reto_a.iniciativas (
    id               SERIAL PRIMARY KEY,
    nombre           VARCHAR(255) NOT NULL,
    responsable      VARCHAR(100) NOT NULL,
    estado           VARCHAR(20)  NOT NULL DEFAULT 'Pendiente'
                       CHECK (estado IN ('Pendiente', 'En curso', 'Completado')),
    fecha_limite     DATE         NOT NULL,
    prioridad        VARCHAR(10)  NOT NULL
                       CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
    descripcion      TEXT,
    fecha_creacion   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_iniciativas_estado
    ON reto_a.iniciativas (estado);

  CREATE INDEX IF NOT EXISTS idx_iniciativas_prioridad
    ON reto_a.iniciativas (prioridad);

  CREATE INDEX IF NOT EXISTS idx_iniciativas_fecha_limite
    ON reto_a.iniciativas (fecha_limite);
`;

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(SQL_INIT);
    console.log('✅  Database schema initialized (reto_a.iniciativas)');
  } catch (err) {
    console.error('❌  Error initializing database schema:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { initializeDatabase };

/**
 * MÓDULO DE CONEXIÓN — PostgreSQL Pool
 *
 * Crea y exporta un Pool de conexiones configurado con variables de entorno.
 * Expone:
 *   - db.query(text, params)  → wrapper del pool para consultas directas
 *   - db.pool                 → instancia raw para transacciones (BEGIN/COMMIT)
 *   - db.testConnection()     → prueba SELECT NOW() para verificar conectividad
 */

'use strict';

const { Pool } = require('pg');

// ── Pool de conexiones ────────────────────────────────────────────────────────
// Lee credenciales exclusivamente desde variables de entorno.
// Nunca hardcodear credenciales en este archivo.
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),

    // Límites del pool (ajustar según carga esperada)
    max: 10,   // máximo de clientes simultáneos
    idleTimeoutMillis: 30000,   // liberar clientes inactivos tras 30 s
    connectionTimeoutMillis: 5000,  // timeout al adquirir un cliente
});

// ── Eventos del Pool ──────────────────────────────────────────────────────────

/**
 * Se dispara cada vez que un nuevo cliente se conecta al pool.
 * Útil para confirmar en log que la BD acepta conexiones.
 */
pool.on('connect', (client) => {
    console.log(`🔗 [DB] Nueva conexión establecida con PostgreSQL (${client.database ?? process.env.DB_DATABASE})`);
});

/**
 * Captura errores en clientes idle del pool (p.ej. pérdida de conexión
 * con el servidor de BD mientras el cliente estaba en reposo).
 * Sin este handler, el error no capturado derribaría el proceso Node.
 */
pool.on('error', (err) => {
    console.error('❌ [DB] Error inesperado en cliente idle del pool:', err.message);
    // No se hace process.exit() aquí; el pool intentará reconectar.
});

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Ejecuta una consulta parametrizada usando el pool.
 * @param {string} text  - Sentencia SQL con placeholders ($1, $2, …)
 * @param {Array}  params - Valores que reemplazan los placeholders
 */
const query = (text, params) => pool.query(text, params);

/**
 * Prueba de conectividad: ejecuta SELECT NOW() y retorna la timestamp del servidor.
 * Se llama desde server.js al arrancar para confirmar que la BD está disponible.
 * @returns {Promise<string>} ISO timestamp devuelto por PostgreSQL
 */
const testConnection = async () => {
    const result = await pool.query('SELECT NOW() AS now');
    return result.rows[0].now;
};

module.exports = { query, pool, testConnection };

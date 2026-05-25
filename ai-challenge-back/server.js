/**
 * PUNTO DE ENTRADA — Servidor Express
 *
 * Responsabilidades:
 *  1. Cargar variables de entorno (.env) ANTES de cualquier otro módulo.
 *  2. Verificar conectividad con PostgreSQL (SELECT NOW()) antes de aceptar tráfico.
 *  3. Iniciar el servidor HTTP en el puerto configurado.
 */

'use strict';

// ── 1. Variables de entorno ───────────────────────────────────────────────────
// dotenv debe cargarse como primera instrucción para que todos los módulos
// posteriores ya vean las variables en process.env.
require('dotenv').config();

// ── 2. Importaciones ──────────────────────────────────────────────────────────
const app = require('./src/app');
const { testConnection } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// ── 3. Arranque asíncrono ─────────────────────────────────────────────────────
const startServer = async () => {
    try {
        // Prueba de conectividad: ejecuta SELECT NOW() sobre el pool.
        // Si la BD no está disponible, lanza un error antes de abrir el puerto.
        const dbTimestamp = await testConnection();
        console.log(`✅ [DB] PostgreSQL conectado — servidor de BD: ${new Date(dbTimestamp).toISOString()}`);

        // Iniciar el servidor HTTP solo si la BD responde correctamente.
        app.listen(PORT, () => {
            console.log(`🚀 [SERVER] Servidor Express corriendo en http://localhost:${PORT}`);
            console.log(`📡 [SERVER] Endpoints disponibles: GET|POST /api/incidents  ·  PUT /api/incidents/:id/status`);
            console.log(`🔍 [SERVER] Health check: http://localhost:${PORT}/health`);
        });

    } catch (err) {
        // Error crítico: no se puede conectar a la BD.
        // El proceso debe terminar para que el orquestador (PM2, Docker, etc.)
        // pueda reiniciarlo cuando la BD esté disponible.
        console.error('❌ [SERVER] No se pudo conectar a PostgreSQL. El servidor no iniciará.');
        console.error('   Detalle:', err.message);
        process.exit(1);
    }
};

// Ejecutar el arranque
startServer();

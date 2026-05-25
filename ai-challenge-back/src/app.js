/**
 * CONFIGURACIÓN PRINCIPAL DE EXPRESS
 *
 * Responsabilidades:
 *  - Registrar middleware global (CORS, JSON parsing, request logger)
 *  - Montar las rutas de negocio bajo /api
 *  - Exponer el health check
 *  - Centralizar el manejo de errores (404 y 500)
 *
 * NOTA: dotenv ya fue cargado en server.js (punto de entrada).
 *       No se vuelve a llamar aquí para evitar cargas duplicadas.
 */

'use strict';

const express = require('express');
const cors = require('cors');
const incidentsRoutes = require('./routes/incidentsRoutes');

const app = express();

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE GLOBAL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * CORS — permite peticiones desde el frontend.
 * La URL de origen se lee de FRONTEND_URL (variable de entorno).
 * En desarrollo, el fallback es http://localhost:5173 (Vite).
 */
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Parser de cuerpos JSON.
 * Limita el tamaño del payload a 1 MB para prevenir ataques de payload gigante.
 */
app.use(express.json({ limit: '1mb' }));

/**
 * Logger de requests.
 * Imprime método, path y timestamp en cada petición entrante.
 * En producción se reemplazaría por un middleware de logging (morgan, winston).
 */
app.use((req, _res, next) => {
    console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ═══════════════════════════════════════════════════════════════════════════════
// RUTAS DE NEGOCIO
// ═══════════════════════════════════════════════════════════════════════════════

// Incidentes
app.use('/api/incidents', incidentsRoutes);

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /health
 * Devuelve el estado del servidor y la timestamp actual.
 * Usado por load balancers, orquestadores y monitores de uptime.
 */
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MANEJO DE ERRORES GLOBAL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * 404 — Ruta no encontrada.
 * Debe ir DESPUÉS de todas las rutas registradas.
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.path,
    });
});

/**
 * 500 — Error interno genérico.
 * Captura cualquier error no manejado en las rutas/controladores.
 * La firma de cuatro parámetros es obligatoria para que Express lo reconozca
 * como error handler.
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
    console.error('❌ [APP] Error no manejado:', err.message);
    res.status(err.status || 500).json({
        success: false,
        error: 'Error interno del servidor',
        message: err.message,
    });
});

module.exports = app;

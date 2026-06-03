/* ============================================================
   SERVER.JS — Servidor Express principal
   Web App de Métricas — reto_b
   ============================================================ */

'use strict';

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');

// Routers
const categoriasRouter = require('./routes/categorias');
const periodosRouter   = require('./routes/periodos');
const metricasRouter   = require('./routes/metricas');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middlewares globales ────────────────────────────────── */
app.use(cors({
  origin: '*',                        // En producción, restringir al origen del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ── Servir archivos estáticos del frontend ──────────────── */
// El frontend se encuentra en ../proyecto/
const frontendPath = path.join(__dirname, '..', 'proyecto');
app.use(express.static(frontendPath));

/* ── Rutas de la API ─────────────────────────────────────── */
app.use('/api/categorias', categoriasRouter);
app.use('/api/periodos',   periodosRouter);
app.use('/api/metricas',   metricasRouter);

/* ── Health check ────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ── Ruta comodín: devolver index.html para SPA ──────────── */
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

/* ── Manejo global de errores ────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(500).json({ error: 'Error interno del servidor', detail: err.message });
});

/* ── Iniciar servidor ────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Frontend servido desde: ${frontendPath}`);
  console.log(`🔗 API disponible en: http://localhost:${PORT}/api`);
});

module.exports = app;

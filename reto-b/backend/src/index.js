'use strict';

/**
 * Application entry point (SRP: only wires middleware, routes, and starts server).
 * Config, error handling, and middleware are imported from dedicated modules.
 */

const express = require('express');
const cors    = require('cors');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Core middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API routes ─────────────────────────────────────────────────────────────
app.use('/api/metricas',  require('./routes/metricas'));
app.use('/api/periodos',  require('./routes/periodos'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/reporte',   require('./routes/reporte'));

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API running', timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint no encontrado' });
});

// ── Global error handler (must be last) ───────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

/* istanbul ignore next */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
  });
}

module.exports = app;

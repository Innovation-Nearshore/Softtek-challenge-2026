'use strict';

const express = require('express');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');

const solicitudesRouter = require('./routes/solicitudes');
const catalogosRouter = require('./routes/catalogos');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', solicitudesRouter);
app.use('/api', catalogosRouter);

// Health-check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;

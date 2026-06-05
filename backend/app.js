'use strict';

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();

const initiativesRouter = require('./routes/initiatives');
const dashboardRouter   = require('./routes/dashboard');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ─── Security & Parsing ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/initiatives', initiativesRouter);
app.use('/api/dashboard',   dashboardRouter);

// ─── Error handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;

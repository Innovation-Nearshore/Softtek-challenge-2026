require('dotenv').config();
const express = require('express');
const cors = require('cors');

const initiativesRouter = require('./routes/initiatives.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/initiatives', initiativesRouter);

// Health-check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404 fallback
app.use((_req, res) => res.status(404).json({ success: false, message: 'Ruta no encontrada.' }));

// ── Start ────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Server] Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;

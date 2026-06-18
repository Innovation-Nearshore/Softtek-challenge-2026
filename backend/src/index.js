require('dotenv').config();
const express = require('express');
const cors = require('cors');

const areasRouter = require('./routes/areas');
const tiposSolicitudRouter = require('./routes/tiposSolicitud');
const solicitudesRouter = require('./routes/solicitudes');
const metricsRouter = require('./routes/metrics');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:5173,http://localhost:5174,http://localhost:4173'
)
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Body parser ───────────────────────────────────────────────────────────
app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/areas', areasRouter);
app.use('/api/tipos-solicitud', tiposSolicitudRouter);
app.use('/api/solicitudes', solicitudesRouter);
app.use('/api/metrics', metricsRouter);

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API running', timestamp: new Date().toISOString() });
});

// ─── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// ─── Global error handler ──────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

module.exports = app;

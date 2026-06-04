require('dotenv').config();
const express = require('express');
const cors = require('cors');

const iniciativasRouter = require('./routes/iniciativas');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/iniciativas', iniciativasRouter);

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL',
    connectionString: `${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  });
});

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// ── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
  });
});

// ── Start server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`✅  Tracker Iniciativas BFF corriendo en http://localhost:${PORT}`);
  console.log(`🔗  Base de datos: ${process.env.DB_NAME || 'ai_challenge'} (${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432})`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n❌  El puerto ${PORT} ya está en uso.\n` +
      `   Solución: detén el proceso que lo ocupa o cambia PORT en el archivo .env\n` +
      `   Para liberar el puerto en Windows ejecuta:\n` +
      `     netstat -ano | findstr :${PORT}\n` +
      `   Luego: taskkill /PID <PID> /F\n`
    );
  } else {
    console.error('Error al iniciar el servidor:', err.message);
  }
  process.exit(1);
});

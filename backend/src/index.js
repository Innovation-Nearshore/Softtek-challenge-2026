const express = require('express');
const cors = require('cors');
require('dotenv').config();

const tiposRouter      = require('./routes/tipos');
const areasRouter      = require('./routes/areas');
const solicitudesRouter = require('./routes/solicitudes');
const historialRouter  = require('./routes/historial');
const metricsRouter    = require('./routes/metrics');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tipos-solicitud', tiposRouter);
app.use('/api/areas',          areasRouter);
app.use('/api/solicitudes',    solicitudesRouter);
app.use('/api/historial',      historialRouter);
app.use('/api/metrics',        metricsRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

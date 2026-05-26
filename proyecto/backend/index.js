require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const solicitudesRouter = require('./routes/solicitudes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Catalog routes
app.get('/api/tipos-solicitud', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, codigo, descripcion, sla_horas, requiere_aprobacion FROM reto_c.tipos_solicitud ORDER BY nombre'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tipos_solicitud:', err);
    res.status(500).json({ error: 'Error fetching tipos_solicitud', detail: err.message });
  }
});

app.get('/api/areas', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, descripcion FROM reto_c.areas ORDER BY nombre');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching areas:', err);
    res.status(500).json({ error: 'Error fetching areas', detail: err.message });
  }
});

// Solicitudes routes
app.use('/api/solicitudes', solicitudesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

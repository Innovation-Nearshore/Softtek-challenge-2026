require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initiativesRouter = require('./routes/initiatives');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Set search_path for every new pg client
const pool = require('./config/db');
pool.on('connect', (client) => {
  client.query(`SET search_path TO ${process.env.DB_SCHEMA || 'reto_a'}, public`);
});

// Routes
app.use('/api/initiatives', initiativesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Error interno del servidor. Por favor, intente de nuevo.',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// PostgreSQL Pool
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ai_challenge',
  user: 'postgres',
  password: 'admin'
});

// Test DB connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.message);
  } else {
    console.log('Connected to PostgreSQL successfully');
    release();
  }
});

// GET /api/incidentes - fetch all incidents with category name
app.get('/api/incidentes', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, c.nombre as categoria
       FROM reto_d.incidentes i
       JOIN reto_d.categorias c ON i.categoria_id = c.id
       ORDER BY i.fecha_creacion DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GET /api/incidentes error:', error.message);
    res.status(500).json({ error: 'Error fetching incidents', details: error.message });
  }
});

// GET /api/categorias - fetch all categories
app.get('/api/categorias', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM reto_d.categorias ORDER BY nombre`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GET /api/categorias error:', error.message);
    res.status(500).json({ error: 'Error fetching categories', details: error.message });
  }
});

// POST /api/incidentes - create new incident
app.post('/api/incidentes', async (req, res) => {
  const { titulo, severidad, area_afectada, categoria_id, descripcion, reportador } = req.body;

  if (!titulo || !severidad || !area_afectada) {
    return res.status(400).json({ error: 'titulo, severidad and area_afectada are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertResult = await client.query(
      `INSERT INTO reto_d.incidentes (titulo, severidad, area_afectada, categoria_id, descripcion, reportador, estado)
       VALUES ($1, $2, $3, $4, $5, $6, 'Abierto')
       RETURNING *`,
      [titulo, severidad, area_afectada, categoria_id || null, descripcion || null, reportador || null]
    );

    const newIncident = insertResult.rows[0];

    await client.query(
      `INSERT INTO reto_d.incident_log (incident_id, old_status, new_status, note)
       VALUES ($1, NULL, 'Abierto', 'Incidente registrado')`,
      [newIncident.id]
    );

    await client.query('COMMIT');
    res.status(201).json(newIncident);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('POST /api/incidentes error:', error.message);
    res.status(500).json({ error: 'Error creating incident', details: error.message });
  } finally {
    client.release();
  }
});

// PATCH /api/incidentes/:id/estado - update incident status
app.patch('/api/incidentes/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ error: 'estado is required' });
  }

  const validStates = ['Abierto', 'En atención', 'Cerrado'];
  if (!validStates.includes(estado)) {
    return res.status(400).json({ error: 'Invalid estado value' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get current status
    const currentResult = await client.query(
      `SELECT estado FROM reto_d.incidentes WHERE id = $1`,
      [id]
    );

    if (currentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Incident not found' });
    }

    const oldStatus = currentResult.rows[0].estado;

    // Update status
    const updateResult = await client.query(
      `UPDATE reto_d.incidentes SET estado = $1 WHERE id = $2 RETURNING *`,
      [estado, id]
    );

    // Insert log
    await client.query(
      `INSERT INTO reto_d.incident_log (incident_id, old_status, new_status, note)
       VALUES ($1, $2, $3, $4)`,
      [id, oldStatus, estado, `Estado cambiado de ${oldStatus} a ${estado}`]
    );

    await client.query('COMMIT');
    res.json(updateResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('PATCH /api/incidentes/:id/estado error:', error.message);
    res.status(500).json({ error: 'Error updating incident status', details: error.message });
  } finally {
    client.release();
  }
});

// GET /api/incidentes/:id/log - fetch incident history log
app.get('/api/incidentes/:id/log', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM reto_d.incident_log WHERE incident_id = $1 ORDER BY changed_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GET /api/incidentes/:id/log error:', error.message);
    res.status(500).json({ error: 'Error fetching incident log', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

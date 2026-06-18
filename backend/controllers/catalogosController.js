const pool = require('../db/connection');

const SCHEMA = process.env.DB_SCHEMA || 'reto_c';

// GET /api/areas — Devuelve todas las áreas disponibles para el formulario
const getAreas = async (req, res) => {
  try {
    const resultado = await pool.query(`SELECT id, nombre FROM ${SCHEMA}.areas ORDER BY nombre ASC`);
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener áreas:', error.message);
    res.status(500).json({ error: 'Error interno al obtener áreas.' });
  }
};

// GET /api/tipos-solicitud — Devuelve todos los tipos de solicitud disponibles
const getTiposSolicitud = async (req, res) => {
  try {
    const resultado = await pool.query(`SELECT id, nombre FROM ${SCHEMA}.tipos_solicitud ORDER BY nombre ASC`);
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener tipos de solicitud:', error.message);
    res.status(500).json({ error: 'Error interno al obtener tipos de solicitud.' });
  }
};

module.exports = { getAreas, getTiposSolicitud };

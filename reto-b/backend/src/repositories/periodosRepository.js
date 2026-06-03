'use strict';

/**
 * Periodos Repository (SRP: only data-persistence operations for periodos).
 * All SQL for the periodos table lives here — no business logic.
 */

const pool = require('../config/database');

const PeriodosRepository = {
  /**
   * Returns all periods ordered by year and month descending.
   * @returns {Promise<Object[]>}
   */
  async findAll() {
    const { rows } = await pool.query(
      'SELECT * FROM periodos ORDER BY anio DESC, mes DESC'
    );
    return rows;
  },

  /**
   * Finds a period by its primary key.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM periodos WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Finds a period by year and month.
   * @param {number} anio
   * @param {number} mes
   * @returns {Promise<Object|null>}
   */
  async findByAnioMes(anio, mes) {
    const { rows } = await pool.query(
      'SELECT * FROM periodos WHERE anio = $1 AND mes = $2',
      [anio, mes]
    );
    return rows[0] || null;
  },

  /**
   * Creates a new period. Returns the inserted row.
   * @param {{ anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin }} data
   * @returns {Promise<Object>}
   */
  async create({ anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin }) {
    const { rows } = await pool.query(
      `INSERT INTO periodos (anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin]
    );
    return rows[0];
  },

  /**
   * Inserts or updates a period (upsert by anio+mes). Returns the row.
   * @param {{ anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin }} data
   * @returns {Promise<Object>}
   */
  async upsert({ anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin }) {
    const { rows } = await pool.query(
      `INSERT INTO periodos (anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (anio, mes) DO UPDATE
         SET nombre_mes   = EXCLUDED.nombre_mes,
             trimestre    = EXCLUDED.trimestre,
             fecha_inicio = EXCLUDED.fecha_inicio,
             fecha_fin    = EXCLUDED.fecha_fin
       RETURNING *`,
      [anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin]
    );
    return rows[0];
  },

  /**
   * Deletes a period by id. Returns the deleted row or null.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async deleteById(id) {
    const { rows } = await pool.query(
      'DELETE FROM periodos WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = PeriodosRepository;

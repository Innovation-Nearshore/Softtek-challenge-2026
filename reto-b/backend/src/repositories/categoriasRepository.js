'use strict';

/**
 * Categorias Repository (SRP: only data-persistence operations for categorias_metricas).
 * All SQL for categorias_metricas lives here — no business logic.
 */

const pool = require('../config/database');

const CategoriasRepository = {
  /**
   * Returns all categories ordered by name.
   * @returns {Promise<Object[]>}
   */
  async findAll() {
    const { rows } = await pool.query(
      'SELECT * FROM categorias_metricas ORDER BY nombre'
    );
    return rows;
  },

  /**
   * Finds a category by its primary key.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM categorias_metricas WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Creates a new category. Returns the inserted row.
   * @param {{ nombre, descripcion, color_hex }} data
   * @returns {Promise<Object>}
   */
  async create({ nombre, descripcion, color_hex }) {
    const { rows } = await pool.query(
      `INSERT INTO categorias_metricas (nombre, descripcion, color_hex)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, descripcion || null, color_hex || null]
    );
    return rows[0];
  },

  /**
   * Updates an existing category. Returns updated row or null if not found.
   * @param {number} id
   * @param {{ nombre, descripcion, color_hex }} data
   * @returns {Promise<Object|null>}
   */
  async update(id, { nombre, descripcion, color_hex }) {
    const { rows } = await pool.query(
      `UPDATE categorias_metricas
       SET nombre      = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           color_hex   = COALESCE($3, color_hex)
       WHERE id = $4
       RETURNING *`,
      [nombre || null, descripcion || null, color_hex || null, id]
    );
    return rows[0] || null;
  },

  /**
   * Deletes a category by id. Returns the deleted row or null.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async deleteById(id) {
    const { rows } = await pool.query(
      'DELETE FROM categorias_metricas WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = CategoriasRepository;

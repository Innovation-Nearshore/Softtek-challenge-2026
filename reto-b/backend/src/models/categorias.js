const pool = require('../db');

const CategoriasModel = {
  async getAll() {
    const result = await pool.query(
      'SELECT * FROM reto_b.categorias_metricas ORDER BY nombre'
    );
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      'SELECT * FROM reto_b.categorias_metricas WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async create({ nombre, descripcion, color_hex }) {
    const result = await pool.query(
      `INSERT INTO reto_b.categorias_metricas (nombre, descripcion, color_hex)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, descripcion || null, color_hex || null]
    );
    return result.rows[0];
  },

  async update(id, { nombre, descripcion, color_hex }) {
    const result = await pool.query(
      `UPDATE reto_b.categorias_metricas
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           color_hex = COALESCE($3, color_hex)
       WHERE id = $4
       RETURNING *`,
      [nombre || null, descripcion || null, color_hex || null, id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM reto_b.categorias_metricas WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = CategoriasModel;

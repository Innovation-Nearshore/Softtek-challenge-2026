const pool = require('../db');

const PeriodosModel = {
  async getAll() {
    const result = await pool.query(
      'SELECT * FROM reto_b.periodos ORDER BY anio DESC, mes DESC'
    );
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      'SELECT * FROM reto_b.periodos WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async getByAnioMes(anio, mes) {
    const result = await pool.query(
      'SELECT * FROM reto_b.periodos WHERE anio = $1 AND mes = $2',
      [anio, mes]
    );
    return result.rows[0] || null;
  },

  async create({ anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin }) {
    const result = await pool.query(
      `INSERT INTO reto_b.periodos (anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin]
    );
    return result.rows[0];
  },

  async upsert({ anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin }) {
    const result = await pool.query(
      `INSERT INTO reto_b.periodos (anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (anio, mes) DO UPDATE
         SET nombre_mes = EXCLUDED.nombre_mes,
             trimestre = EXCLUDED.trimestre,
             fecha_inicio = EXCLUDED.fecha_inicio,
             fecha_fin = EXCLUDED.fecha_fin
       RETURNING *`,
      [anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM reto_b.periodos WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = PeriodosModel;

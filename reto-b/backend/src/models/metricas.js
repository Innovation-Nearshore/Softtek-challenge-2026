const pool = require('../db');

const MetricasModel = {
  async getAll({ periodo_id, categoria_id, anio, trimestre } = {}) {
    let query = `
      SELECT
        mm.*,
        p.anio, p.mes, p.nombre_mes, p.trimestre,
        p.fecha_inicio, p.fecha_fin,
        c.nombre AS categoria_nombre,
        c.color_hex AS categoria_color
      FROM reto_b.metricas_mensuales mm
      JOIN reto_b.periodos p ON mm.periodo_id = p.id
      JOIN reto_b.categorias_metricas c ON mm.categoria_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (periodo_id) {
      params.push(periodo_id);
      query += ` AND mm.periodo_id = $${params.length}`;
    }
    if (categoria_id) {
      params.push(categoria_id);
      query += ` AND mm.categoria_id = $${params.length}`;
    }
    if (anio) {
      params.push(anio);
      query += ` AND p.anio = $${params.length}`;
    }
    if (trimestre) {
      params.push(trimestre);
      query += ` AND p.trimestre = $${params.length}`;
    }

    query += ' ORDER BY p.anio DESC, p.mes DESC, c.nombre, mm.nombre_metrica';

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT
        mm.*,
        p.anio, p.mes, p.nombre_mes, p.trimestre,
        p.fecha_inicio, p.fecha_fin,
        c.nombre AS categoria_nombre,
        c.color_hex AS categoria_color
      FROM reto_b.metricas_mensuales mm
      JOIN reto_b.periodos p ON mm.periodo_id = p.id
      JOIN reto_b.categorias_metricas c ON mm.categoria_id = c.id
      WHERE mm.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async create({
    periodo_id,
    categoria_id,
    nombre_metrica,
    valor_actual,
    valor_objetivo,
    unidad,
    notas,
  }) {
    const result = await pool.query(
      `INSERT INTO reto_b.metricas_mensuales
         (periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        periodo_id,
        categoria_id,
        nombre_metrica,
        valor_actual,
        valor_objetivo || null,
        unidad || null,
        notas || null,
      ]
    );
    return result.rows[0];
  },

  async update(id, { periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas }) {
    const result = await pool.query(
      `UPDATE reto_b.metricas_mensuales
       SET periodo_id      = COALESCE($1, periodo_id),
           categoria_id    = COALESCE($2, categoria_id),
           nombre_metrica  = COALESCE($3, nombre_metrica),
           valor_actual    = COALESCE($4, valor_actual),
           valor_objetivo  = COALESCE($5, valor_objetivo),
           unidad          = COALESCE($6, unidad),
           notas           = COALESCE($7, notas)
       WHERE id = $8
       RETURNING *`,
      [
        periodo_id || null,
        categoria_id || null,
        nombre_metrica || null,
        valor_actual !== undefined ? valor_actual : null,
        valor_objetivo !== undefined ? valor_objetivo : null,
        unidad !== undefined ? unidad : null,
        notas !== undefined ? notas : null,
        id,
      ]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM reto_b.metricas_mensuales WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },

  async bulkInsert(records) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = [];
      for (const rec of records) {
        const r = await client.query(
          `INSERT INTO reto_b.metricas_mensuales
             (periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (periodo_id, categoria_id, nombre_metrica) DO UPDATE
             SET valor_actual   = EXCLUDED.valor_actual,
                 valor_objetivo = EXCLUDED.valor_objetivo,
                 unidad         = EXCLUDED.unidad,
                 notas          = EXCLUDED.notas
           RETURNING *`,
          [
            rec.periodo_id,
            rec.categoria_id,
            rec.nombre_metrica,
            rec.valor_actual,
            rec.valor_objetivo || null,
            rec.unidad || null,
            rec.notas || null,
          ]
        );
        inserted.push(r.rows[0]);
      }
      await client.query('COMMIT');
      return inserted;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Returns per-category summary. Field names match what the frontend Dashboard expects:
   * categoria, color_hex, total_metricas, valor_actual_promedio, valor_objetivo_promedio,
   * metricas_cumplidas, metricas_con_objetivo, porcentaje_cumplimiento
   */
  async getSummaryByCategoria({ anio, trimestre, periodo_id } = {}) {
    let query = `
      SELECT
        c.id AS categoria_id,
        c.nombre AS categoria,
        c.color_hex,
        COUNT(mm.id) AS total_metricas,
        AVG(mm.valor_actual) AS valor_actual_promedio,
        AVG(mm.valor_objetivo) AS valor_objetivo_promedio,
        SUM(CASE WHEN mm.valor_objetivo IS NOT NULL AND mm.valor_actual >= mm.valor_objetivo THEN 1 ELSE 0 END) AS metricas_cumplidas,
        SUM(CASE WHEN mm.valor_objetivo IS NOT NULL THEN 1 ELSE 0 END) AS metricas_con_objetivo,
        CASE
          WHEN SUM(CASE WHEN mm.valor_objetivo IS NOT NULL THEN 1 ELSE 0 END) > 0
          THEN ROUND(
            SUM(CASE WHEN mm.valor_objetivo IS NOT NULL AND mm.valor_actual >= mm.valor_objetivo THEN 1 ELSE 0 END)::numeric /
            SUM(CASE WHEN mm.valor_objetivo IS NOT NULL THEN 1 ELSE 0 END) * 100, 1
          )
          ELSE 0
        END AS porcentaje_cumplimiento
      FROM reto_b.categorias_metricas c
      LEFT JOIN reto_b.metricas_mensuales mm ON c.id = mm.categoria_id
      LEFT JOIN reto_b.periodos p ON mm.periodo_id = p.id
      WHERE 1=1
    `;
    const params = [];
    if (periodo_id) {
      params.push(periodo_id);
      query += ` AND mm.periodo_id = $${params.length}`;
    }
    if (anio) {
      params.push(anio);
      query += ` AND p.anio = $${params.length}`;
    }
    if (trimestre) {
      params.push(trimestre);
      query += ` AND p.trimestre = $${params.length}`;
    }
    query += ' GROUP BY c.id, c.nombre, c.color_hex ORDER BY c.nombre';

    const result = await pool.query(query, params);
    return result.rows;
  },
};

module.exports = MetricasModel;

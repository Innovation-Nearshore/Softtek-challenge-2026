'use strict';

/**
 * Metricas Repository (SRP: only data-persistence operations for metricas_mensuales).
 * All SQL for metricas_mensuales lives here — no business logic, no CSV handling.
 */

const pool = require('../config/database');

const MetricasRepository = {
  /**
   * Returns all metrics with period and category join data.
   * Supports optional filtering by periodo_id, categoria_id, anio, trimestre.
   * @param {{ periodo_id?, categoria_id?, anio?, trimestre? }} filters
   * @returns {Promise<Object[]>}
   */
  async findAll({ periodo_id, categoria_id, anio, trimestre } = {}) {
    let query = `
      SELECT
        mm.*,
        p.anio, p.mes, p.nombre_mes, p.trimestre,
        p.fecha_inicio, p.fecha_fin,
        c.nombre   AS categoria_nombre,
        c.color_hex AS categoria_color
      FROM metricas_mensuales mm
      JOIN periodos p           ON mm.periodo_id  = p.id
      JOIN categorias_metricas c ON mm.categoria_id = c.id
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

    const { rows } = await pool.query(query, params);
    return rows;
  },

  /**
   * Finds a single metric by primary key (with joins).
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const { rows } = await pool.query(
      `SELECT
        mm.*,
        p.anio, p.mes, p.nombre_mes, p.trimestre,
        p.fecha_inicio, p.fecha_fin,
        c.nombre   AS categoria_nombre,
        c.color_hex AS categoria_color
      FROM metricas_mensuales mm
      JOIN periodos p           ON mm.periodo_id  = p.id
      JOIN categorias_metricas c ON mm.categoria_id = c.id
      WHERE mm.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Creates a new metric row. Returns the inserted row.
   * @param {{ periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo?, unidad?, notas? }} data
   * @returns {Promise<Object>}
   */
  async create({ periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas }) {
    const { rows } = await pool.query(
      `INSERT INTO metricas_mensuales
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
    return rows[0];
  },

  /**
   * Updates an existing metric. Returns updated row or null if not found.
   * @param {number} id
   * @param {{ periodo_id?, categoria_id?, nombre_metrica?, valor_actual?, valor_objetivo?, unidad?, notas? }} data
   * @returns {Promise<Object|null>}
   */
  async update(id, { periodo_id, categoria_id, nombre_metrica, valor_actual, valor_objetivo, unidad, notas }) {
    const { rows } = await pool.query(
      `UPDATE metricas_mensuales
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
    return rows[0] || null;
  },

  /**
   * Deletes a metric by id. Returns the deleted row or null.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async deleteById(id) {
    const { rows } = await pool.query(
      'DELETE FROM metricas_mensuales WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Bulk-inserts metrics in a transaction using upsert on conflict.
   * @param {Object[]} records
   * @returns {Promise<Object[]>} inserted/updated rows
   */
  async bulkUpsert(records) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = [];
      for (const rec of records) {
        const { rows } = await client.query(
          `INSERT INTO metricas_mensuales
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
        inserted.push(rows[0]);
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
   * Returns per-category summary aggregations.
   * @param {{ anio?, trimestre?, periodo_id? }} filters
   * @returns {Promise<Object[]>}
   */
  async getSummaryByCategoria({ anio, trimestre, periodo_id } = {}) {
    let query = `
      SELECT
        c.id       AS categoria_id,
        c.nombre   AS categoria,
        c.color_hex,
        COUNT(mm.id)                                   AS total_metricas,
        AVG(mm.valor_actual)                           AS valor_actual_promedio,
        AVG(mm.valor_objetivo)                         AS valor_objetivo_promedio,
        SUM(CASE WHEN mm.valor_objetivo IS NOT NULL AND mm.valor_actual >= mm.valor_objetivo THEN 1 ELSE 0 END) AS metricas_cumplidas,
        SUM(CASE WHEN mm.valor_objetivo IS NOT NULL THEN 1 ELSE 0 END)                                          AS metricas_con_objetivo,
        CASE
          WHEN SUM(CASE WHEN mm.valor_objetivo IS NOT NULL THEN 1 ELSE 0 END) > 0
          THEN ROUND(
            SUM(CASE WHEN mm.valor_objetivo IS NOT NULL AND mm.valor_actual >= mm.valor_objetivo THEN 1 ELSE 0 END)::numeric /
            SUM(CASE WHEN mm.valor_objetivo IS NOT NULL THEN 1 ELSE 0 END) * 100, 1
          )
          ELSE 0
        END AS porcentaje_cumplimiento
      FROM categorias_metricas c
      LEFT JOIN metricas_mensuales mm ON c.id = mm.categoria_id
      LEFT JOIN periodos p            ON mm.periodo_id = p.id
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

    const { rows } = await pool.query(query, params);
    return rows;
  },
};

module.exports = MetricasRepository;

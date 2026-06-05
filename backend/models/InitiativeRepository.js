'use strict';

const { query } = require('../config/database');

const SCHEMA = 'reto_a';
const TABLE  = `${SCHEMA}.iniciativas`;

/**
 * Repository encapsulating all database operations for the
 * `reto_a.iniciativas` table.  Follows the Repository pattern (SRP) so
 * controllers never touch SQL directly.
 */
class InitiativeRepository {
  // ─── READ ────────────────────────────────────────────────────────────────

  /**
   * Return all initiatives ordered by creation date (newest first).
   * Optional estado filter.
   */
  async findAll({ estado } = {}) {
    if (estado) {
      const { rows } = await query(
        `SELECT * FROM ${TABLE} WHERE estado = $1 ORDER BY fecha_creacion DESC`,
        [estado]
      );
      return rows;
    }
    const { rows } = await query(
      `SELECT * FROM ${TABLE} ORDER BY fecha_creacion DESC`
    );
    return rows;
  }

  /**
   * Return a single initiative by primary key.
   */
  async findById(id) {
    const { rows } = await query(
      `SELECT * FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  // ─── WRITE ───────────────────────────────────────────────────────────────

  /**
   * Insert a new initiative and return the created record.
   */
  async create({ nombre, responsable, estado, fecha_limite, prioridad, descripcion }) {
    const { rows } = await query(
      `INSERT INTO ${TABLE}
         (nombre, responsable, estado, fecha_limite, prioridad, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre, responsable, estado || 'Pendiente', fecha_limite, prioridad, descripcion || null]
    );
    return rows[0];
  }

  /**
   * Update an existing initiative and return the updated record.
   */
  async update(id, { nombre, responsable, estado, fecha_limite, prioridad, descripcion }) {
    const { rows } = await query(
      `UPDATE ${TABLE}
       SET nombre       = $1,
           responsable  = $2,
           estado       = $3,
           fecha_limite = $4,
           prioridad    = $5,
           descripcion  = $6,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [nombre, responsable, estado, fecha_limite, prioridad, descripcion || null, id]
    );
    return rows[0] || null;
  }

  /**
   * Partially update an initiative — only the fields present in `fields`
   * are written. Dynamically builds the SET clause so missing columns are
   * never overwritten. Follows OCP: no change needed here when new columns
   * are added (just add them to ALLOWED_COLUMNS).
   *
   * @param {number} id
   * @param {Object} fields  - key/value pairs of columns to update
   * @returns {Object|null}  - updated row or null when not found
   */
  async partialUpdate(id, fields) {
    const ALLOWED_COLUMNS = ['nombre', 'responsable', 'estado', 'fecha_limite', 'prioridad', 'descripcion'];
    const entries = Object.entries(fields).filter(([k]) => ALLOWED_COLUMNS.includes(k));

    if (entries.length === 0) {
      throw new Error('No se proporcionaron campos válidos para actualizar.');
    }

    // Build parameterised SET clause: nombre = $1, responsable = $2, …
    const setClauses = entries.map(([col], i) => `${col} = $${i + 1}`);
    setClauses.push('fecha_actualizacion = CURRENT_TIMESTAMP');

    const values = entries.map(([, v]) => v);
    values.push(id); // last param → WHERE id = $N

    const { rows } = await query(
      `UPDATE ${TABLE}
       SET ${setClauses.join(', ')}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );
    return rows[0] || null;
  }

  /**
   * Delete an initiative by id. Returns true if a row was deleted.
   */
  async delete(id) {
    const { rowCount } = await query(
      `DELETE FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    return rowCount > 0;
  }

  // ─── DASHBOARD METRICS ───────────────────────────────────────────────────

  /**
   * Count of initiatives grouped by estado.
   * Returns [{ estado, count }]
   */
  async countByEstado() {
    const { rows } = await query(
      `SELECT estado, COUNT(*)::int AS count
       FROM ${TABLE}
       GROUP BY estado`
    );
    return rows;
  }

  /**
   * Total number of registered initiatives.
   */
  async countTotal() {
    const { rows } = await query(`SELECT COUNT(*)::int AS total FROM ${TABLE}`);
    return rows[0].total;
  }

  /**
   * Count initiatives in 'Pendiente' status whose fecha_limite < today.
   */
  async countOverduePending() {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS count
       FROM ${TABLE}
       WHERE estado = 'Pendiente'
         AND fecha_limite < CURRENT_DATE`
    );
    return rows[0].count;
  }

  /**
   * Count of initiatives grouped by prioridad.
   * Returns [{ prioridad, count }]
   */
  async countByPrioridad() {
    const { rows } = await query(
      `SELECT prioridad, COUNT(*)::int AS count
       FROM ${TABLE}
       GROUP BY prioridad
       ORDER BY
         CASE prioridad
           WHEN 'Alta'  THEN 1
           WHEN 'Media' THEN 2
           WHEN 'Baja'  THEN 3
         END`
    );
    return rows;
  }

  /**
   * Average number of days between fecha_creacion and the first time the
   * initiative moved to 'En curso'.
   *
   * Since we don't store a separate transition-log table, we approximate by
   * computing AVG(fecha_actualizacion - fecha_creacion) for all rows whose
   * current estado is 'En curso' or 'Completado' (i.e. rows that have been
   * started at some point).  Returns a float rounded to 2 decimal places, or
   * null when there are no qualifying rows.
   */
  async avgDaysToStart() {
    const { rows } = await query(
      `SELECT ROUND(
         AVG(
           EXTRACT(EPOCH FROM (fecha_actualizacion - fecha_creacion)) / 86400
         )::numeric,
         2
       ) AS avg_days
       FROM ${TABLE}
       WHERE estado IN ('En curso', 'Completado')`
    );
    return rows[0].avg_days !== null ? parseFloat(rows[0].avg_days) : null;
  }

  /**
   * Percentage of 'Completado' initiatives vs total (0–100, rounded to 1 dp).
   * Returns 0 when table is empty.
   */
  async completedPercentage() {
    const { rows } = await query(
      `SELECT
         COUNT(*)::float                                               AS total,
         COUNT(*) FILTER (WHERE estado = 'Completado')::float         AS completed
       FROM ${TABLE}`
    );
    const { total, completed } = rows[0];
    if (!total || total === 0) return 0;
    return Math.round((completed / total) * 1000) / 10; // 1 decimal place
  }
}

module.exports = new InitiativeRepository();

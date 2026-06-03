'use strict';

/**
 * Metricas Service (SRP: business logic for metricas domain, including CSV import).
 * Depends on repositories and utility modules through composition (DIP).
 * Does NOT handle HTTP concerns or raw DB queries.
 */

const fs = require('fs');
const csv = require('csv-parser');

const MetricasRepository = require('../repositories/metricasRepository');
const PeriodosRepository = require('../repositories/periodosRepository');
const CategoriasRepository = require('../repositories/categoriasRepository');
const { validateAllRows } = require('../utils/csvValidator');
const { buildPeriodoFromAnioMes } = require('../utils/dateUtils');
const { HttpError } = require('../utils/httpError');

const MetricasService = {
  /**
   * Returns all metrics, with optional filters.
   * @param {{ periodo_id?, categoria_id?, anio?, trimestre? }} filters
   * @returns {Promise<Object[]>}
   */
  async getAll(filters) {
    return MetricasRepository.findAll(filters);
  },

  /**
   * Returns a metric by id or throws 404.
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const metrica = await MetricasRepository.findById(id);
    if (!metrica) throw HttpError.notFound('Métrica no encontrada');
    return metrica;
  },

  /**
   * Creates a new metric after validating required fields and FK existence.
   * @param {{ periodo_id, categoria_id, nombre_metrica, valor_actual, ...rest }} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const { periodo_id, categoria_id, nombre_metrica, valor_actual } = data;

    if (!periodo_id)    throw HttpError.badRequest('periodo_id es requerido');
    if (!categoria_id)  throw HttpError.badRequest('categoria_id es requerido');
    if (!nombre_metrica) throw HttpError.badRequest('nombre_metrica es requerido');
    if (valor_actual === undefined || valor_actual === null) {
      throw HttpError.badRequest('valor_actual es requerido');
    }

    const periodo   = await PeriodosRepository.findById(periodo_id);
    if (!periodo)   throw HttpError.badRequest('periodo_id no existe');

    const categoria = await CategoriasRepository.findById(categoria_id);
    if (!categoria) throw HttpError.badRequest('categoria_id no existe');

    return MetricasRepository.create(data);
  },

  /**
   * Updates a metric by id or throws 404.
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const existing = await MetricasRepository.findById(id);
    if (!existing) throw HttpError.notFound('Métrica no encontrada');
    return MetricasRepository.update(id, data);
  },

  /**
   * Deletes a metric by id or throws 404.
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async delete(id) {
    const deleted = await MetricasRepository.deleteById(id);
    if (!deleted) throw HttpError.notFound('Métrica no encontrada');
    return deleted;
  },

  /**
   * Processes a CSV file: reads, validates all rows, resolves FK references,
   * and bulk-upserts the records. Cleans up the temp file afterwards.
   * @param {string} filePath - Path to the uploaded temp CSV file
   * @returns {Promise<{ inserted: number, records: Object[] }>}
   */
  async processCsv(filePath) {
    return new Promise((resolve, reject) => {
      const rows = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('error', (err) =>
          reject(HttpError.badRequest(`Error leyendo CSV: ${err.message}`))
        )
        .on('end', async () => {
          try {
            // 1. Validate all rows upfront
            const { valid, errors } = validateAllRows(rows);
            if (!valid) {
              throw HttpError.unprocessable('Errores de validación en CSV', errors);
            }

            // 2. Resolve FK references (periodos + categorias), caching to avoid repeated DB hits
            const periodoCache   = {};
            const categoriaCache = {};
            const records        = [];

            for (const row of rows) {
              const anio = parseInt(row.anio, 10);
              const mes  = parseInt(row.mes, 10);
              const periodoKey = `${anio}-${mes}`;

              if (!periodoCache[periodoKey]) {
                let periodo = await PeriodosRepository.findByAnioMes(anio, mes);
                if (!periodo) {
                  periodo = await PeriodosRepository.create(buildPeriodoFromAnioMes(anio, mes));
                }
                periodoCache[periodoKey] = periodo;
              }

              const categoriaNombre = row.categoria_nombre.trim();
              if (!categoriaCache[categoriaNombre]) {
                const allCats = await CategoriasRepository.findAll();
                const found = allCats.find(
                  (c) => c.nombre.toLowerCase() === categoriaNombre.toLowerCase()
                );
                if (!found) {
                  throw HttpError.unprocessable(
                    `Categoría no encontrada: "${categoriaNombre}". Créela primero.`
                  );
                }
                categoriaCache[categoriaNombre] = found;
              }

              records.push({
                periodo_id:    periodoCache[periodoKey].id,
                categoria_id:  categoriaCache[categoriaNombre].id,
                nombre_metrica: row.nombre_metrica.trim(),
                valor_actual:   parseFloat(row.valor_actual),
                valor_objetivo: row.valor_objetivo ? parseFloat(row.valor_objetivo) : null,
                unidad:         row.unidad ? row.unidad.trim() : null,
                notas:          row.notas  ? row.notas.trim()  : null,
              });
            }

            // 3. Bulk upsert
            const inserted = await MetricasRepository.bulkUpsert(records);
            resolve({ inserted: inserted.length, records: inserted });
          } catch (err) {
            reject(err);
          } finally {
            // Always clean up the temp file
            try { fs.unlinkSync(filePath); } catch (_) {}
          }
        });
    });
  },

  /**
   * Returns per-category summary aggregations.
   * @param {{ anio?, trimestre?, periodo_id? }} filters
   * @returns {Promise<Object[]>}
   */
  async getSummary(filters) {
    return MetricasRepository.getSummaryByCategoria(filters);
  },
};

module.exports = MetricasService;

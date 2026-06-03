'use strict';

/**
 * Periodos Service (SRP: business logic only for periodos domain).
 * Depends on PeriodosRepository through composition (DIP).
 * Does NOT handle HTTP concerns or raw DB queries.
 */

const PeriodosRepository = require('../repositories/periodosRepository');
const { HttpError } = require('../utils/httpError');

const PeriodosService = {
  /**
   * Returns all periods.
   * @returns {Promise<Object[]>}
   */
  async getAll() {
    return PeriodosRepository.findAll();
  },

  /**
   * Returns a period by id or throws 404.
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const periodo = await PeriodosRepository.findById(id);
    if (!periodo) throw HttpError.notFound('Período no encontrado');
    return periodo;
  },

  /**
   * Creates or updates (upserts) a period.
   * Validates that anio and mes are present.
   * @param {{ anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin }} data
   * @returns {Promise<Object>}
   */
  async upsert(data) {
    const { anio, mes } = data;
    if (!anio || !mes) {
      throw HttpError.badRequest('anio y mes son requeridos');
    }
    return PeriodosRepository.upsert(data);
  },

  /**
   * Deletes a period by id or throws 404.
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async delete(id) {
    const deleted = await PeriodosRepository.deleteById(id);
    if (!deleted) throw HttpError.notFound('Período no encontrado');
    return deleted;
  },
};

module.exports = PeriodosService;

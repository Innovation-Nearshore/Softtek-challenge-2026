'use strict';

/**
 * Categorias Service (SRP: business logic only for categorias domain).
 * Depends on CategoriasRepository through composition (DIP).
 * Does NOT handle HTTP concerns or raw DB queries.
 */

const CategoriasRepository = require('../repositories/categoriasRepository');
const { HttpError } = require('../utils/httpError');

const CategoriasService = {
  /**
   * Returns all categories.
   * @returns {Promise<Object[]>}
   */
  async getAll() {
    return CategoriasRepository.findAll();
  },

  /**
   * Returns a category by id or throws 404.
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const categoria = await CategoriasRepository.findById(id);
    if (!categoria) throw HttpError.notFound('Categoría no encontrada');
    return categoria;
  },

  /**
   * Creates a new category. Validates that nombre is present.
   * @param {{ nombre, descripcion?, color_hex? }} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const { nombre } = data;
    if (!nombre || nombre.trim() === '') {
      throw HttpError.badRequest('nombre es requerido');
    }
    return CategoriasRepository.create(data);
  },

  /**
   * Updates an existing category or throws 404.
   * @param {number} id
   * @param {{ nombre?, descripcion?, color_hex? }} data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const updated = await CategoriasRepository.update(id, data);
    if (!updated) throw HttpError.notFound('Categoría no encontrada');
    return updated;
  },

  /**
   * Deletes a category or throws 404.
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async delete(id) {
    const deleted = await CategoriasRepository.deleteById(id);
    if (!deleted) throw HttpError.notFound('Categoría no encontrada');
    return deleted;
  },
};

module.exports = CategoriasService;

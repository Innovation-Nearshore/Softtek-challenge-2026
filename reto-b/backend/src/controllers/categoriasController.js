'use strict';

/**
 * Categorias Controller (SRP: HTTP parsing + response only, no business logic).
 * Delegates all work to CategoriasService.
 * Postgres unique-constraint (23505) and FK-violation (23503) errors are
 * translated to appropriate HTTP codes here so controllers remain the single
 * translation point between DB and HTTP.
 */

const CategoriasService = require('../services/categoriasService');

const CategoriasController = {
  /**
   * GET /api/categorias
   */
  async getAll(_req, res, next) {
    try {
      const categorias = await CategoriasService.getAll();
      res.json({ success: true, data: categorias });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/categorias/:id
   */
  async getById(req, res, next) {
    try {
      const categoria = await CategoriasService.getById(parseInt(req.params.id, 10));
      res.json({ success: true, data: categoria });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/categorias
   */
  async create(req, res, next) {
    try {
      const categoria = await CategoriasService.create(req.body);
      res.status(201).json({ success: true, data: categoria });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
      }
      next(err);
    }
  },

  /**
   * PUT /api/categorias/:id
   */
  async update(req, res, next) {
    try {
      const updated = await CategoriasService.update(parseInt(req.params.id, 10), req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
      }
      next(err);
    }
  },

  /**
   * DELETE /api/categorias/:id
   */
  async delete(req, res, next) {
    try {
      const deleted = await CategoriasService.delete(parseInt(req.params.id, 10));
      res.json({ success: true, data: deleted });
    } catch (err) {
      if (err.code === '23503') {
        return res.status(409).json({
          success: false,
          message: 'No se puede eliminar: la categoría tiene métricas asociadas',
        });
      }
      next(err);
    }
  },
};

module.exports = CategoriasController;

'use strict';

/**
 * Periodos Controller (SRP: HTTP parsing + response only, no business logic).
 * Delegates all work to PeriodosService.
 */

const PeriodosService = require('../services/periodosService');

const PeriodosController = {
  /**
   * GET /api/periodos
   */
  async getAll(_req, res, next) {
    try {
      const periodos = await PeriodosService.getAll();
      res.json({ success: true, data: periodos });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/periodos/:id
   */
  async getById(req, res, next) {
    try {
      const periodo = await PeriodosService.getById(parseInt(req.params.id, 10));
      res.json({ success: true, data: periodo });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/periodos
   */
  async upsert(req, res, next) {
    try {
      const periodo = await PeriodosService.upsert(req.body);
      res.status(201).json({ success: true, data: periodo });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/periodos/:id
   */
  async delete(req, res, next) {
    try {
      const deleted = await PeriodosService.delete(parseInt(req.params.id, 10));
      res.json({ success: true, data: deleted });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = PeriodosController;

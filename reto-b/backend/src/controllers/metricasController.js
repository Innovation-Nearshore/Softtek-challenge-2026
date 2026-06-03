'use strict';

/**
 * Metricas Controller (SRP: HTTP parsing + response only, no business logic).
 * Delegates all work to MetricasService.
 */

const MetricasService = require('../services/metricasService');

const MetricasController = {
  /**
   * GET /api/metricas
   */
  async getAll(req, res, next) {
    try {
      const { periodo_id, categoria_id, anio, trimestre } = req.query;
      const metricas = await MetricasService.getAll({
        periodo_id:  periodo_id  ? parseInt(periodo_id, 10)  : undefined,
        categoria_id: categoria_id ? parseInt(categoria_id, 10) : undefined,
        anio:        anio        ? parseInt(anio, 10)        : undefined,
        trimestre:   trimestre   ? parseInt(trimestre, 10)   : undefined,
      });
      res.json({ success: true, data: metricas });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/metricas/summary
   */
  async getSummary(req, res, next) {
    try {
      const { anio, trimestre, periodo_id } = req.query;
      const summary = await MetricasService.getSummary({
        anio:       anio       ? parseInt(anio, 10)       : undefined,
        trimestre:  trimestre  ? parseInt(trimestre, 10)  : undefined,
        periodo_id: periodo_id ? parseInt(periodo_id, 10) : undefined,
      });
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/metricas/upload-csv
   */
  async uploadCsv(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se proporcionó ningún archivo CSV' });
      }
      const result = await MetricasService.processCsv(req.file.path);
      res.status(201).json({ success: true, inserted: result.inserted, records: result.records });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/metricas/:id
   */
  async getById(req, res, next) {
    try {
      const metrica = await MetricasService.getById(parseInt(req.params.id, 10));
      res.json({ success: true, data: metrica });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/metricas
   */
  async create(req, res, next) {
    try {
      const metrica = await MetricasService.create(req.body);
      res.status(201).json({ success: true, data: metrica });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/metricas/:id
   */
  async update(req, res, next) {
    try {
      const metrica = await MetricasService.update(parseInt(req.params.id, 10), req.body);
      res.json({ success: true, data: metrica });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/metricas/:id
   */
  async delete(req, res, next) {
    try {
      const deleted = await MetricasService.delete(parseInt(req.params.id, 10));
      res.json({ success: true, data: deleted });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = MetricasController;

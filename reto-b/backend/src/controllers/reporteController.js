'use strict';

/**
 * Reporte Controller (SRP: HTTP parsing + response only, no business logic).
 * Delegates PDF generation to ReporteService.
 */

const ReporteService = require('../services/reporteService');

const ReporteController = {
  /**
   * GET /api/reporte/pdf?periodo_id=&anio=&trimestre=&categoria_id=
   */
  async getPdf(req, res, next) {
    try {
      const { anio, trimestre, categoria_id, periodo_id } = req.query;
      const filters = {
        periodo_id:   periodo_id   ? parseInt(periodo_id, 10)   : undefined,
        anio:         anio         ? parseInt(anio, 10)         : undefined,
        trimestre:    trimestre    ? parseInt(trimestre, 10)    : undefined,
        categoria_id: categoria_id ? parseInt(categoria_id, 10) : undefined,
      };
      await ReporteService.generarPDF(filters, res);
    } catch (err) {
      if (!res.headersSent) {
        next(err);
      }
    }
  },
};

module.exports = ReporteController;

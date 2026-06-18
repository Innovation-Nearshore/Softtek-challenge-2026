'use strict';

const areasRepo = require('../repositories/areasRepository');
const tiposSolicitudRepo = require('../repositories/tiposSolicitudRepository');

/**
 * GET /api/areas
 */
async function getAreas(req, res, next) {
  try {
    const areas = await areasRepo.getAll();
    return res.json({ success: true, data: areas });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tipos-solicitud
 */
async function getTiposSolicitud(req, res, next) {
  try {
    const tipos = await tiposSolicitudRepo.getAll();
    return res.json({ success: true, data: tipos });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAreas, getTiposSolicitud };

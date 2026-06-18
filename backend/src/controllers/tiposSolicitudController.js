const tiposSolicitudService = require('../services/tiposSolicitudService');

async function getTiposSolicitud(req, res, next) {
  try {
    const tipos = await tiposSolicitudService.getAllTiposSolicitud();
    res.json({ success: true, data: tipos });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTiposSolicitud };

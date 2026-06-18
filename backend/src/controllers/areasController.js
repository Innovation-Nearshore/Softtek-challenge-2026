const areasService = require('../services/areasService');

async function getAreas(req, res, next) {
  try {
    const areas = await areasService.getAllAreas();
    res.json({ success: true, data: areas });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAreas };

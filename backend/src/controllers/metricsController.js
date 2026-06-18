const metricsService = require('../services/metricsService');

async function getMetrics(req, res, next) {
  try {
    const metrics = await metricsService.getMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMetrics };

const express = require('express');
const router = express.Router();
const { getMetrics } = require('../controllers/metricsController');

// GET /api/metrics
// Returns counts by estado and by urgencia. No caching so polling always gets fresh data.
router.get('/', getMetrics);

module.exports = router;

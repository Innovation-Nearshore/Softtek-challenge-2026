'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/dashboardController');

const router = Router();

/**
 * Dashboard routes — all under /api/dashboard
 */
router.get('/metrics',               ctrl.getMetrics);
router.get('/status-counts',         ctrl.getStatusCounts);
router.get('/priority-distribution', ctrl.getPriorityDistribution);
router.get('/overdue',               ctrl.getOverdueCount);
router.get('/avg-time-to-start',     ctrl.getAvgTimeToStart);

module.exports = router;

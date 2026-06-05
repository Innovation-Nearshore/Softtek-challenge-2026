'use strict';

const repository = require('../models/InitiativeRepository');

/**
 * Dashboard controller — aggregates KPI metrics from the repository.
 * Each handler has a single responsibility (SRP).
 */

/**
 * GET /api/dashboard/metrics
 * Returns all dashboard KPIs in a single request to minimize round-trips.
 */
const getMetrics = async (req, res, next) => {
  try {
    const [
      total,
      byEstado,
      overduePending,
      byPrioridad,
      avgDaysToStart,
      completedPct,
    ] = await Promise.all([
      repository.countTotal(),
      repository.countByEstado(),
      repository.countOverduePending(),
      repository.countByPrioridad(),
      repository.avgDaysToStart(),
      repository.completedPercentage(),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byEstado,
        overduePending,
        byPrioridad,
        avgDaysToStart,
        completedPercentage: completedPct,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/status-counts
 * Returns initiative counts grouped by estado.
 */
const getStatusCounts = async (req, res, next) => {
  try {
    const data = await repository.countByEstado();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/priority-distribution
 * Returns initiative counts grouped by prioridad.
 */
const getPriorityDistribution = async (req, res, next) => {
  try {
    const data = await repository.countByPrioridad();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/overdue
 * Returns count of overdue pending initiatives.
 */
const getOverdueCount = async (req, res, next) => {
  try {
    const count = await repository.countOverduePending();
    res.json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/avg-time-to-start
 * Returns avg days from creation to first status change (to En curso).
 */
const getAvgTimeToStart = async (req, res, next) => {
  try {
    const avgDays = await repository.avgDaysToStart();
    res.json({ success: true, data: { avgDays } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMetrics,
  getStatusCounts,
  getPriorityDistribution,
  getOverdueCount,
  getAvgTimeToStart,
};

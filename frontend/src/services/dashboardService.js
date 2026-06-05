import apiClient from './apiClient'

/**
 * Service: dashboardService
 * Encapsulates all HTTP operations for dashboard metrics.
 * Single responsibility: dashboard data access.
 */
const dashboardService = {
  /**
   * Get all dashboard metrics in a single call.
   */
  getMetrics: () => apiClient.get('/dashboard/metrics'),

  /**
   * Get priority distribution (Alta/Media/Baja counts).
   */
  getPriorityDistribution: () => apiClient.get('/dashboard/priority-distribution'),

  /**
   * Get count of overdue pending initiatives.
   */
  getOverdueCount: () => apiClient.get('/dashboard/overdue'),

  /**
   * Get average days from creation to "En curso" status.
   */
  getAvgTimeToStart: () => apiClient.get('/dashboard/avg-time-to-start'),

  /**
   * Get initiatives count grouped by status.
   */
  getStatusCounts: () => apiClient.get('/dashboard/status-counts'),
}

export default dashboardService

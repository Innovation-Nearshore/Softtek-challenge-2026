import { useState, useEffect, useCallback } from 'react'
import dashboardService from '../services/dashboardService'

/**
 * Hook: useDashboardMetrics
 * Fetches and manages all dashboard KPI metrics.
 * Decouples dashboard data logic from UI components (SOLID - SRP).
 */
const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardService.getMetrics()
      setMetrics(data?.data || data || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  }
}

export default useDashboardMetrics

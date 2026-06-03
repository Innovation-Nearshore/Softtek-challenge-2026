import { useState, useEffect, useCallback } from 'react'
import {
  getMetricas,
  getMetricaById,
  createMetrica,
  updateMetrica,
  deleteMetrica,
  uploadCSV,
  getResumen,
} from '../api/metricas'

/**
 * Custom hook for metricas state management.
 * SRP: encapsulates data-fetching, filters, loading, error/success state.
 * OCP: components extend behaviour by passing different filter params.
 */
export function useMetricas(filters = {}) {
  const [metricas, setMetricas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchAll = useCallback(() => {
    setLoading(true)
    setError('')
    getMetricas(filters)
      .then(setMetricas)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const getOne = useCallback(async (id) => {
    setError('')
    return getMetricaById(id)
  }, [])

  const save = useCallback(
    async (id, data) => {
      setError('')
      if (id) {
        await updateMetrica(id, data)
        setSuccess('Métrica actualizada.')
      } else {
        await createMetrica(data)
        setSuccess('Métrica creada.')
      }
      fetchAll()
    },
    [fetchAll]
  )

  const remove = useCallback(
    async (id) => {
      setError('')
      await deleteMetrica(id)
      setSuccess('Métrica eliminada.')
      fetchAll()
    },
    [fetchAll]
  )

  const importCSV = useCallback(
    async (file) => {
      setError('')
      const result = await uploadCSV(file)
      setSuccess(`CSV importado: ${result.inserted ?? result.count ?? 'OK'} registros.`)
      fetchAll()
      return result
    },
    [fetchAll]
  )

  const clearMessages = useCallback(() => {
    setError('')
    setSuccess('')
  }, [])

  return {
    metricas,
    loading,
    error,
    success,
    setError,
    setSuccess,
    clearMessages,
    refresh: fetchAll,
    getOne,
    save,
    remove,
    importCSV,
  }
}

/**
 * Custom hook for the metrics summary (dashboard data).
 * SRP: isolated from CRUD operations.
 */
export function useResumen(filters = {}) {
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchResumen = useCallback(() => {
    setLoading(true)
    setError('')
    getResumen(filters)
      .then(setResumen)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchResumen()
  }, [fetchResumen])

  return { resumen, loading, error, refresh: fetchResumen }
}

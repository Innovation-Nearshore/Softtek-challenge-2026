import { useState, useEffect, useCallback } from 'react'
import { getPeriodos, upsertPeriodo, deletePeriodo } from '../api/periodos'

/**
 * Custom hook for periodos state management (SRP: encapsulates all period
 * data-fetching, loading, and error state; pages only consume results).
 */
export function usePeriodos() {
  const [periodos, setPeriodos]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  const fetchAll = useCallback(() => {
    setLoading(true)
    setError('')
    getPeriodos()
      .then(setPeriodos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const save = useCallback(async (data) => {
    setError('')
    await upsertPeriodo(data)
    setSuccess('Período guardado correctamente.')
    fetchAll()
  }, [fetchAll])

  const remove = useCallback(async (id) => {
    setError('')
    await deletePeriodo(id)
    setSuccess('Período eliminado.')
    fetchAll()
  }, [fetchAll])

  const clearMessages = useCallback(() => {
    setError('')
    setSuccess('')
  }, [])

  return {
    periodos,
    loading,
    error,
    success,
    setError,
    setSuccess,
    clearMessages,
    refresh: fetchAll,
    save,
    remove,
  }
}

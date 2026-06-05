import { useState, useEffect, useCallback } from 'react'
import initiativesService from '../services/initiativesService'

/**
 * Hook: useInitiatives
 * Manages CRUD operations and state for initiatives.
 * Decouples business logic from UI components (SOLID - SRP).
 */
const useInitiatives = (statusFilter = 'Todos') => {
  const [initiatives, setInitiatives] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchInitiatives = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await initiativesService.getAll(statusFilter)
      setInitiatives(data?.data || data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchInitiatives()
  }, [fetchInitiatives])

  const createInitiative = useCallback(async (payload) => {
    const result = await initiativesService.create(payload)
    await fetchInitiatives()
    return result
  }, [fetchInitiatives])

  const updateInitiative = useCallback(async (id, payload) => {
    const result = await initiativesService.update(id, payload)
    await fetchInitiatives()
    return result
  }, [fetchInitiatives])

  /** Partial update — sends only the changed fields via PATCH */
  const patchInitiative = useCallback(async (id, fields) => {
    const result = await initiativesService.patch(id, fields)
    await fetchInitiatives()
    return result
  }, [fetchInitiatives])

  const deleteInitiative = useCallback(async (id) => {
    await initiativesService.delete(id)
    await fetchInitiatives()
  }, [fetchInitiatives])

  return {
    initiatives,
    loading,
    error,
    refetch: fetchInitiatives,
    createInitiative,
    updateInitiative,
    patchInitiative,
    deleteInitiative,
  }
}

export default useInitiatives

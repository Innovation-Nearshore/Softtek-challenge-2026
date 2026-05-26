/**
 * useRequests.js
 * Custom hook managing the full lifecycle of solicitudes:
 * fetching, filtering, status updates, creation, and deletion.
 * Also loads reference data (areas, tipos) from the API.
 */

import { useState, useCallback, useEffect } from 'react'
import {
  fetchAreas,
  fetchTipos,
  fetchRequests,
  createRequest,
  updateRequestStatus,
  deleteRequest,
  getErrorMessage,
} from '../services/requestsService'

export function useRequests() {
  const [requests, setRequests] = useState([])
  const [areas,    setAreas]    = useState([])
  const [tipos,    setTipos]    = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [filters,  setFilters]  = useState({ tipo_id: '', urgencia: '' })

  // ── Load reference data once on mount ──────────────────────────────────────
  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [areasData, tiposData] = await Promise.all([fetchAreas(), fetchTipos()])
        setAreas(areasData)
        setTipos(tiposData)
      } catch (err) {
        console.error('Error loading reference data:', getErrorMessage(err))
      }
    }
    loadReferenceData()
  }, [])

  // ── Fetch solicitudes ───────────────────────────────────────────────────────
  const loadRequests = useCallback(async (overrideFilters) => {
    setLoading(true)
    setError(null)
    try {
      const activeFilters = overrideFilters !== undefined ? overrideFilters : filters
      const data = await fetchRequests(activeFilters)
      setRequests(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [filters])

  // ── Update a filter key and re-fetch immediately ────────────────────────────
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      setLoading(true)
      setError(null)
      fetchRequests(next)
        .then((data) => setRequests(data))
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false))
      return next
    })
  }, [])

  // ── Create a new solicitud ──────────────────────────────────────────────────
  const handleCreateRequest = useCallback(async (payload) => {
    setLoading(true)
    setError(null)
    try {
      await createRequest(payload)
      const data = await fetchRequests(filters)
      setRequests(data)
      return true
    } catch (err) {
      setError(getErrorMessage(err))
      return false
    } finally {
      setLoading(false)
    }
  }, [filters])

  // ── Change status of a single solicitud ────────────────────────────────────
  const handleStatusChange = useCallback(async (id, newStatus) => {
    setError(null)
    try {
      await updateRequestStatus(id, newStatus)
      // Optimistic update
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: newStatus } : r))
      )
    } catch (err) {
      const msg = getErrorMessage(err)
      setError(msg)
      // Revert optimistic update by re-loading
      const data = await fetchRequests(filters).catch(() => null)
      if (data) setRequests(data)
      // Re-throw so per-row UI in RequestsTable can display inline feedback
      throw new Error(msg)
    }
  }, [filters])

  // ── Delete a solicitud ─────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id) => {
    setError(null)
    try {
      await deleteRequest(id)
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    requests,
    areas,
    tipos,
    loading,
    error,
    filters,
    loadRequests,
    handleFilterChange,
    handleCreateRequest,
    handleStatusChange,
    handleDelete,
    clearError,
  }
}

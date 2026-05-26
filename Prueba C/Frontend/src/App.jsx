/**
 * App.jsx
 * Root application component.
 * Wires Module 1 (RequestsTable) and Module 2 (RequestFormModal)
 * through the useRequests hook, passing reference data (areas, tipos) as props.
 */

import { useState, useCallback } from 'react'
import { useRequests } from './hooks/useRequests'
import RequestsTable   from './components/RequestsTable'
import RequestFormModal from './components/RequestFormModal'

export default function App() {
  // ── Global state ───────────────────────────────────────────────────────────
  const {
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
  } = useRequests()

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modalOpen,   setModalOpen]   = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── Modal handlers ─────────────────────────────────────────────────────────
  const openModal = useCallback(() => {
    setSubmitError('')
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    if (submitting) return
    setModalOpen(false)
    setSubmitError('')
  }, [submitting])

  const handleSubmit = useCallback(async (payload) => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const ok = await handleCreateRequest(payload)
      if (!ok) {
        setSubmitError('No se pudo guardar la solicitud. Intente nuevamente.')
        return false
      }
      return true
    } catch {
      setSubmitError('Error inesperado. Intente nuevamente.')
      return false
    } finally {
      setSubmitting(false)
    }
  }, [handleCreateRequest])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo + title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-tight">
                  Gestor de Solicitudes Internas
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Soporte · Aprobaciones · Requerimientos
                </p>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Sistema activo
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Global error banner */}
        {error && (
          <div
            className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-sm text-amber-800"
            role="alert"
          >
            <svg
              className="w-4 h-4 mt-0.5 shrink-0 text-amber-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="ml-2 text-amber-600 hover:text-amber-800 shrink-0"
              aria-label="Cerrar alerta"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Module 1: Solicitudes Table ─────────────────────────────────── */}
        <section aria-label="Bandeja de solicitudes">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-800">Bandeja de Solicitudes</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Visualice, filtre y gestione todas las solicitudes internas
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <RequestsTable
              requests={requests}
              tipos={tipos}
              loading={loading}
              error={null}          /* global errors shown in banner above */
              filters={filters}
              onFilterChange={handleFilterChange}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onNewRequest={openModal}
              onLoadRequests={loadRequests}
            />
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-center text-gray-400">
            Gestor de Solicitudes Internas — Softtek Challenge 2026
          </p>
        </div>
      </footer>

      {/* ── Module 2: New Request Modal ─────────────────────────────────────── */}
      <RequestFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitError={submitError}
        areas={areas}
        tipos={tipos}
      />
    </div>
  )
}

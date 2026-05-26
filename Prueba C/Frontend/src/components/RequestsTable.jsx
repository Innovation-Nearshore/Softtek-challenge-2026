/**
 * RequestsTable.jsx
 * Module 1 — Solicitudes inbox.
 * Displays all solicitudes with filters by tipo and urgencia,
 * inline status change (with loading + feedback), delete action,
 * and a "Nueva Solicitud" button.
 *
 * Field mapping (real reto_c schema):
 *   req.tipo        → nombre of tipos_solicitud (JOIN)
 *   req.urgencia    → 'Alta' | 'Media' | 'Baja'
 *   req.descripcion → free text
 *   req.solicitante → name
 *   req.area        → nombre of areas (JOIN)
 *   req.estado      → 'Recibida' | 'En revisión' | 'Resuelta'
 *   req.fecha_creacion → timestamp
 */

import { useEffect, useState, useCallback } from 'react'
import {
  URGENCY_LEVELS,
  REQUEST_STATUSES,
  URGENCY_BADGE_CLASS,
  STATUS_BADGE_CLASS,
} from '../constants'

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CO', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

// ─── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <svg className="w-14 h-14 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p className="text-base font-medium text-gray-500">
        {hasFilters ? 'No hay solicitudes con estos filtros.' : 'No hay solicitudes registradas.'}
      </p>
      {!hasFilters && (
        <p className="text-sm mt-1">Haz clic en &quot;Nueva Solicitud&quot; para empezar.</p>
      )}
    </div>
  )
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(10)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  )
}

// ─── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size = 4 }) {
  return (
    <svg
      className={`animate-spin w-${size} h-${size} text-blue-500`}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

// ─── Status badge (read-only display) ─────────────────────────────────────────
function StatusBadge({ estado }) {
  return (
    <span className={STATUS_BADGE_CLASS[estado] ?? 'badge bg-gray-100 text-gray-600'}>
      {estado}
    </span>
  )
}

// ─── Inline status selector (editable) ────────────────────────────────────────
/**
 * @param {Object}   props
 * @param {number}   props.solicitudId
 * @param {string}   props.currentStatus
 * @param {boolean}  props.isChanging      - true while the API call is in flight
 * @param {string}   [props.rowError]      - per-row error message
 * @param {boolean}  [props.rowSuccess]    - brief success flash
 * @param {Function} props.onStatusChange  - (id, newStatus) => void
 */
function StatusSelector({ solicitudId, currentStatus, isChanging, rowError, rowSuccess, onStatusChange }) {
  const selectColorClass =
    currentStatus === 'Recibida'    ? 'bg-gray-100 text-gray-700 border-gray-200' :
    currentStatus === 'En revisión' ? 'bg-blue-100 text-blue-700 border-blue-200' :
    currentStatus === 'Resuelta'    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
    'bg-gray-100 text-gray-600 border-gray-200'

  return (
    <div className="flex flex-col gap-1 min-w-[130px]">
      <div className="flex items-center gap-1.5">
        {isChanging ? (
          <div className="flex items-center gap-1.5 px-2 py-1">
            <Spinner size={3} />
            <span className="text-xs text-gray-500">Guardando…</span>
          </div>
        ) : (
          <select
            value={currentStatus}
            onChange={(e) => onStatusChange(solicitudId, e.target.value)}
            disabled={isChanging}
            className={`text-xs font-medium rounded-full border px-2 py-1 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              transition-colors appearance-none pr-6 disabled:opacity-60
              ${selectColorClass}`}
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', backgroundSize: '14px' }}
            aria-label={`Cambiar estado de solicitud ${solicitudId}`}
          >
            {REQUEST_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        )}

        {/* Success checkmark flash */}
        {rowSuccess && !isChanging && (
          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Per-row error message */}
      {rowError && !isChanging && (
        <p className="text-xs text-red-600 flex items-center gap-0.5" role="alert">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd" />
          </svg>
          {rowError}
        </p>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
/**
 * @param {Object}   props
 * @param {Array}    props.requests        - List of solicitud objects from the API
 * @param {Array}    props.tipos           - List of tipos_solicitud for the filter dropdown
 * @param {boolean}  props.loading
 * @param {string}   [props.error]
 * @param {{ tipo_id: string, urgencia: string }} props.filters
 * @param {Function} props.onFilterChange  - (key, value) => void
 * @param {Function} props.onStatusChange  - async (id, newStatus) => void
 * @param {Function} props.onDelete        - (id) => void
 * @param {Function} props.onNewRequest    - () => void
 * @param {Function} props.onLoadRequests  - () => void
 */
export default function RequestsTable({
  requests = [],
  tipos = [],
  loading = false,
  error = null,
  filters,
  onFilterChange,
  onStatusChange,
  onDelete,
  onNewRequest,
  onLoadRequests,
}) {
  // Load on mount
  useEffect(() => {
    onLoadRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Per-row status change state ────────────────────────────────────────────
  // changingRows: Set of IDs currently updating
  // rowErrors: { [id]: errorMessage }
  // rowSuccess: { [id]: true } — clears after 2 s
  const [changingRows, setChangingRows] = useState(new Set())
  const [rowErrors,    setRowErrors]    = useState({})
  const [rowSuccess,   setRowSuccess]   = useState({})

  const handleStatusChange = useCallback(async (id, newStatus) => {
    // Clear previous feedback for this row
    setRowErrors((prev) => { const n = { ...prev }; delete n[id]; return n })
    setRowSuccess((prev) => { const n = { ...prev }; delete n[id]; return n })

    // Mark as loading
    setChangingRows((prev) => new Set([...prev, id]))

    try {
      await onStatusChange(id, newStatus)

      // Show success flash
      setRowSuccess((prev) => ({ ...prev, [id]: true }))
      setTimeout(() => {
        setRowSuccess((prev) => { const n = { ...prev }; delete n[id]; return n })
      }, 2000)
    } catch {
      setRowErrors((prev) => ({
        ...prev,
        [id]: 'No se pudo actualizar. Intente nuevamente.',
      }))
    } finally {
      setChangingRows((prev) => {
        const n = new Set(prev)
        n.delete(id)
        return n
      })
    }
  }, [onStatusChange])

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const hasFilters = !!(filters.tipo_id || filters.urgencia)

  const handleClearFilters = () => {
    onFilterChange('tipo_id', '')
    onFilterChange('urgencia', '')
  }

  const confirmDelete = (id) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la solicitud #${id}? Esta acción no se puede deshacer.`)) {
      onDelete(id)
    }
  }

  return (
    <div className="space-y-4">

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Filtrar por:</span>

          {/* Tipo filter — populated from DB */}
          <select
            value={filters.tipo_id}
            onChange={(e) => onFilterChange('tipo_id', e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filtrar por tipo"
          >
            <option value="">Todos los tipos</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>

          {/* Urgencia filter */}
          <select
            value={filters.urgencia}
            onChange={(e) => onFilterChange('urgencia', e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filtrar por urgencia"
          >
            <option value="">Todas las urgencias</option>
            {URGENCY_LEVELS.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Limpiar filtros
            </button>
          )}

          {/* Refresh */}
          <button
            type="button"
            onClick={onLoadRequests}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
              transition-colors disabled:opacity-50"
            aria-label="Actualizar lista"
            title="Actualizar lista"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Nueva Solicitud button */}
        <button
          type="button"
          onClick={onNewRequest}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm
            font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2
            focus:ring-blue-500 focus:ring-offset-2 transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Solicitud
        </button>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-700">
          <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* ── Results count ─────────────────────────────────────────────────────── */}
      {!loading && (
        <p className="text-sm text-gray-500">
          {requests.length === 0
            ? 'Sin resultados'
            : `${requests.length} solicitud${requests.length !== 1 ? 'es' : ''} encontrada${requests.length !== 1 ? 's' : ''}`
          }
          {hasFilters && ' (filtrado)'}
        </p>
      )}

      {/* ── Status legend ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="font-medium">Estados:</span>
        <span className="badge badge-recibida">Recibida</span>
        <span className="text-gray-300">→</span>
        <span className="badge badge-revision">En revisión</span>
        <span className="text-gray-300">→</span>
        <span className="badge badge-resuelta">Resuelta</span>
        <span className="ml-2 text-gray-400 italic">Use el selector en cada fila para cambiar el estado</span>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 w-12">#</th>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Urgencia</th>
              <th className="px-4 py-3 max-w-xs">Descripción</th>
              <th className="px-4 py-3">Solicitante</th>
              <th className="px-4 py-3">Área</th>
              <th className="px-4 py-3">
                <div className="flex items-center gap-1">
                  Estado
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    title="Puede modificar el estado directamente en esta columna">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-3">Creada</th>
              <th className="px-4 py-3 w-16">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <EmptyState hasFilters={hasFilters} />
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const isChanging = changingRows.has(req.id)
                const rowError   = rowErrors[req.id] ?? null
                const hasSuccess = !!rowSuccess[req.id]

                return (
                  <tr
                    key={req.id}
                    className={`transition-colors ${isChanging ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{req.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 whitespace-nowrap">{req.numero_ticket}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{req.tipo}</td>
                    <td className="px-4 py-3">
                      <span className={URGENCY_BADGE_CLASS[req.urgencia] ?? 'badge bg-gray-100 text-gray-600'}>
                        {req.urgencia}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate text-gray-700" title={req.descripcion}>
                        {req.descripcion}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{req.solicitante}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{req.area}</td>
                    <td className="px-4 py-3">
                      <StatusSelector
                        solicitudId={req.id}
                        currentStatus={req.estado}
                        isChanging={isChanging}
                        rowError={rowError}
                        rowSuccess={hasSuccess}
                        onStatusChange={handleStatusChange}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(req.fecha_creacion)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => confirmDelete(req.id)}
                        disabled={isChanging}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50
                          transition-colors disabled:opacity-40"
                        aria-label={`Eliminar solicitud ${req.id}`}
                        title="Eliminar solicitud"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

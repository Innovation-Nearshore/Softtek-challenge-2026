import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useDashboardMetrics from '../hooks/useDashboardMetrics'
import useInitiatives from '../hooks/useInitiatives'
import useToast from '../hooks/useToast'
import Heading from '../components/atoms/Heading'
import Spinner from '../components/atoms/Spinner'
import Badge from '../components/atoms/Badge'
import MetricCard from '../components/molecules/MetricCard'
import StatusFilter from '../components/molecules/StatusFilter'
import PriorityFilter from '../components/molecules/PriorityFilter'
import UpcomingDeadlines from '../components/molecules/UpcomingDeadlines'
import Toast from '../components/molecules/Toast'
import InitiativesTable from '../components/organisms/InitiativesTable'

/**
 * Page: DashboardPage
 * Central visibility hub for the operations area.
 * Features: KPIs, priority distribution, status overview,
 * upcoming-7-day deadlines widget, priority+status filters,
 * and inline editing directly in the quick-view table.
 */
const DashboardPage = () => {
  const [statusFilter, setStatusFilter]     = useState('Todos')
  const [priorityFilter, setPriorityFilter] = useState('Todas')
  const navigate = useNavigate()

  const { toast, showSuccess, showError, hideToast } = useToast()
  const { metrics, loading: metricsLoading, error: metricsError } = useDashboardMetrics()

  // Fetch ALL initiatives (no server-side status filter) so we can:
  //  a) apply client-side status + priority filters for the table
  //  b) feed UpcomingDeadlines with unfiltered data
  const {
    initiatives: allInitiatives,
    loading: tableLoading,
    patchInitiative,
  } = useInitiatives('Todos')

  // ── Derive structured data from backend response arrays ──────────────────
  const statusCountsFromMetrics = (metrics?.byEstado || []).reduce((acc, item) => {
    acc[item.estado] = item.count
    return acc
  }, {})

  const priorityCounts = (metrics?.byPrioridad || []).reduce((acc, item) => {
    acc[item.prioridad] = item.count
    return acc
  }, {})

  const totalInitiatives = metrics?.total ?? 0
  const completedCount   = statusCountsFromMetrics['Completado'] ?? 0
  const completedPct     = metrics?.completedPercentage ?? 0
  const overdueCount     = metrics?.overduePending ?? 0
  const avgDaysToStart   = metrics?.avgDaysToStart != null
    ? Number(metrics.avgDaysToStart).toFixed(1)
    : '—'

  // ── Client-side filtering (status + priority combined) ────────────────────
  const filteredInitiatives = useMemo(() => {
    return allInitiatives.filter((ini) => {
      const matchStatus   = statusFilter   === 'Todos'  || ini.estado    === statusFilter
      const matchPriority = priorityFilter === 'Todas'  || ini.prioridad === priorityFilter
      return matchStatus && matchPriority
    })
  }, [allInitiatives, statusFilter, priorityFilter])

  // Status counts for StatusFilter badges (from full list)
  const statusCounts = useMemo(() =>
    allInitiatives.reduce((acc, item) => {
      acc[item.estado] = (acc[item.estado] || 0) + 1
      return acc
    }, {}),
    [allInitiatives]
  )

  // Priority counts for PriorityFilter badges (from full list)
  const priorityCountsForFilter = useMemo(() =>
    allInitiatives.reduce((acc, item) => {
      acc[item.prioridad] = (acc[item.prioridad] || 0) + 1
      return acc
    }, {}),
    [allInitiatives]
  )

  // ── Priority bar chart data ───────────────────────────────────────────────
  const priorityItems = [
    { label: 'Alta',  count: priorityCounts['Alta']  || 0, color: 'bg-red-500',    textColor: 'text-red-700',    bg: 'bg-red-50' },
    { label: 'Media', count: priorityCounts['Media'] || 0, color: 'bg-orange-500', textColor: 'text-orange-700', bg: 'bg-orange-50' },
    { label: 'Baja',  count: priorityCounts['Baja']  || 0, color: 'bg-gray-400',   textColor: 'text-gray-600',   bg: 'bg-gray-50' },
  ]
  const maxPriorityCount = Math.max(...priorityItems.map(p => p.count), 1)

  // ── Inline update handler — sends ONLY the changed field via PATCH ────────
  const handleInlineUpdate = async (id, field, value) => {
    try {
      await patchInitiative(id, { [field]: value })
      showSuccess('Iniciativa actualizada')
    } catch (err) {
      showError(err.message || 'Error al actualizar')
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Heading level={1}>Dashboard</Heading>
          <p className="mt-1 text-sm text-gray-500">
            Visibilidad centralizada de todas las iniciativas activas
          </p>
        </div>
        <button
          onClick={() => navigate('/initiatives')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Iniciativa
        </button>
      </div>

      {/* Metrics Error */}
      {metricsError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          Error al cargar métricas: {metricsError}
        </div>
      )}

      {/* KPI Cards */}
      {metricsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Iniciativas"
            value={totalInitiatives}
            subtitle="registradas en el sistema"
            accent="blue"
            icon="📋"
          />
          <MetricCard
            title="Completadas"
            value={`${completedPct}%`}
            subtitle={`${completedCount} de ${totalInitiatives} iniciativas`}
            accent="green"
            icon="✅"
          />
          <MetricCard
            title="Vencidas Pendientes"
            value={overdueCount}
            subtitle="requieren atención inmediata"
            accent={overdueCount > 0 ? 'red' : 'green'}
            icon="⚠️"
          />
          <MetricCard
            title="Tiempo Prom. al Inicio"
            value={avgDaysToStart === '—' ? avgDaysToStart : `${avgDaysToStart}d`}
            subtitle="días hasta cambiar a En curso"
            accent="purple"
            icon="⏱️"
          />
        </div>
      )}

      {/* Priority Distribution + Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Distribución por Prioridad</h3>
          {metricsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4">
              {priorityItems.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge type="priority" value={item.label} />
                    </div>
                    <span className={`text-sm font-bold ${item.textColor}`}>{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${(item.count / maxPriorityCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {priorityItems.every(p => p.count === 0) && (
                <p className="text-center text-sm text-gray-400 py-4">Sin datos disponibles</p>
              )}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Estado de Iniciativas</h3>
          {metricsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-3">
              {[
                {
                  label: 'Pendiente',
                  count: statusCountsFromMetrics['Pendiente'] || 0,
                  bg: 'bg-yellow-50',
                  border: 'border-yellow-200',
                  dot: 'bg-yellow-500',
                  text: 'text-yellow-700',
                },
                {
                  label: 'En curso',
                  count: statusCountsFromMetrics['En curso'] || 0,
                  bg: 'bg-blue-50',
                  border: 'border-blue-200',
                  dot: 'bg-blue-500',
                  text: 'text-blue-700',
                },
                {
                  label: 'Completado',
                  count: statusCountsFromMetrics['Completado'] || 0,
                  bg: 'bg-green-50',
                  border: 'border-green-200',
                  dot: 'bg-green-500',
                  text: 'text-green-700',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between p-4 rounded-xl border ${item.bg} ${item.border}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.dot}`} />
                    <span className={`text-sm font-medium ${item.text}`}>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${item.text}`}>{item.count}</span>
                    <span className="text-xs text-gray-400">
                      {totalInitiatives > 0
                        ? `${Math.round((item.count / totalInitiatives) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Deadlines — next 7 days */}
      <UpcomingDeadlines
        initiatives={allInitiatives}
        loading={tableLoading}
      />

      {/* All Initiatives Quick View with Status + Priority filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h3 className="text-base font-semibold text-gray-800">
              Todas las Iniciativas
              {filteredInitiatives.length !== allInitiatives.length && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({filteredInitiatives.length} de {allInitiatives.length})
                </span>
              )}
            </h3>
          </div>

          {/* Status filter row */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide w-16 flex-shrink-0">
                Estado
              </span>
              <StatusFilter
                activeStatus={statusFilter}
                onChange={setStatusFilter}
                counts={statusCounts}
              />
            </div>

            {/* Priority filter row */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide w-16 flex-shrink-0">
                Prioridad
              </span>
              <PriorityFilter
                activePriority={priorityFilter}
                onChange={setPriorityFilter}
                counts={priorityCountsForFilter}
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          <InitiativesTable
            initiatives={filteredInitiatives}
            loading={tableLoading}
            onEdit={(initiative) => navigate('/initiatives', { state: { editId: initiative.id } })}
            onDelete={() => navigate('/initiatives')}
            onInlineUpdate={handleInlineUpdate}
          />
        </div>
      </div>

      {/* Toast Notifications */}
      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  )
}

export default DashboardPage

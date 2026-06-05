import Badge from '../atoms/Badge'
import Spinner from '../atoms/Spinner'

/**
 * Molecule: UpcomingDeadlines
 * Warning card listing initiatives whose deadline falls within the next 7 days.
 * Filters are applied client-side from the already-fetched initiatives array.
 */

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const daysUntil = (dateStr) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = new Date(dateStr)
  deadline.setHours(0, 0, 0, 0)
  return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
}

const UpcomingDeadlines = ({ initiatives = [], loading = false }) => {
  const upcoming = initiatives.filter((ini) => {
    if (!ini.fecha_limite || ini.estado === 'Completado') return false
    const days = daysUntil(ini.fecha_limite)
    return days >= 0 && days <= 7
  })

  // Sort by nearest deadline first
  upcoming.sort(
    (a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite)
  )

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-amber-200 bg-amber-100">
        <span className="text-xl">⏰</span>
        <div>
          <h3 className="text-sm font-semibold text-amber-900">
            Próximos 7 días
          </h3>
          <p className="text-xs text-amber-700">
            Iniciativas con fecha límite inminente
          </p>
        </div>
        <span className="ml-auto inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-full bg-amber-500 text-white text-sm font-bold">
          {loading ? '…' : upcoming.length}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-center text-sm text-amber-700 py-4">
            ✅ No hay iniciativas con vencimiento en los próximos 7 días
          </p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((ini) => {
              const days = daysUntil(ini.fecha_limite)
              const isToday = days === 0
              const isTomorrow = days === 1

              const urgencyLabel = isToday
                ? 'Hoy'
                : isTomorrow
                ? 'Mañana'
                : `en ${days} días`

              const urgencyStyle = days <= 1
                ? 'bg-red-100 text-red-700 border-red-300'
                : days <= 3
                ? 'bg-orange-100 text-orange-700 border-orange-300'
                : 'bg-yellow-100 text-yellow-700 border-yellow-300'

              return (
                <li
                  key={ini.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200 shadow-xs"
                >
                  {/* Urgency pill */}
                  <span
                    className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${urgencyStyle}`}
                  >
                    {urgencyLabel}
                  </span>

                  {/* Initiative info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium text-gray-900 truncate"
                      title={ini.nombre}
                    >
                      {ini.nombre}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {ini.responsable}
                    </p>
                  </div>

                  {/* Priority badge */}
                  <Badge type="priority" value={ini.prioridad} />

                  {/* Date */}
                  <span className="flex-shrink-0 text-xs text-gray-500">
                    {formatDate(ini.fecha_limite)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default UpcomingDeadlines

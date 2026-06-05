/**
 * Molecule: StatusFilter
 * Tab-based filter for initiative statuses.
 */
const STATUSES = ['Todos', 'Pendiente', 'En curso', 'Completado']

const ACTIVE_STYLES = {
  Todos: 'bg-gray-800 text-white',
  Pendiente: 'bg-yellow-500 text-white',
  'En curso': 'bg-blue-600 text-white',
  Completado: 'bg-green-600 text-white',
}

const INACTIVE_STYLES =
  'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'

const StatusFilter = ({ activeStatus, onChange, counts = {} }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((status) => {
        const isActive = activeStatus === status
        const count = status === 'Todos'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[status] ?? 0)

        return (
          <button
            key={status}
            onClick={() => onChange(status)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
              isActive ? ACTIVE_STYLES[status] : INACTIVE_STYLES
            }`}
          >
            {status}
            <span
              className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-bold ${
                isActive ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default StatusFilter

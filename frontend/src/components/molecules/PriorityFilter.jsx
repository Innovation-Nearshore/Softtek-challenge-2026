/**
 * Molecule: PriorityFilter
 * Tab-based filter for initiative priorities.
 * Consistent design with StatusFilter (SRP, reusable).
 */
const PRIORITIES = ['Todas', 'Alta', 'Media', 'Baja']

const ACTIVE_STYLES = {
  Todas: 'bg-gray-800 text-white',
  Alta:  'bg-red-600 text-white',
  Media: 'bg-orange-500 text-white',
  Baja:  'bg-gray-500 text-white',
}

const INACTIVE_STYLES =
  'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'

const PriorityFilter = ({ activePriority, onChange, counts = {} }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {PRIORITIES.map((priority) => {
        const isActive = activePriority === priority
        const count =
          priority === 'Todas'
            ? Object.values(counts).reduce((a, b) => a + b, 0)
            : (counts[priority] ?? 0)

        return (
          <button
            key={priority}
            onClick={() => onChange(priority)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
              isActive ? ACTIVE_STYLES[priority] : INACTIVE_STYLES
            }`}
          >
            {priority}
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

export default PriorityFilter

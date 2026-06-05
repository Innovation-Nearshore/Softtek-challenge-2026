import { Droppable } from '@hello-pangea/dnd'
import KanbanCard from '../molecules/KanbanCard'
import Badge from '../atoms/Badge'

/**
 * Organism: KanbanColumn
 * Renders a single Kanban swimlane for a given status.
 */
const COLUMN_STYLES = {
  Pendiente: {
    header: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-400',
    count: 'bg-amber-100 text-amber-700',
    droppableOver: 'bg-amber-50/80',
    droppable: 'bg-gray-50/50',
  },
  'En curso': {
    header: 'bg-blue-50 border-blue-200',
    dot: 'bg-blue-500',
    count: 'bg-blue-100 text-blue-700',
    droppableOver: 'bg-blue-50/80',
    droppable: 'bg-gray-50/50',
  },
  Completado: {
    header: 'bg-green-50 border-green-200',
    dot: 'bg-green-500',
    count: 'bg-green-100 text-green-700',
    droppableOver: 'bg-green-50/80',
    droppable: 'bg-gray-50/50',
  },
}

const KanbanColumn = ({ status, initiatives }) => {
  const styles = COLUMN_STYLES[status] || COLUMN_STYLES['Pendiente']

  return (
    <div className="flex flex-col w-72 flex-shrink-0 min-h-[500px]">
      {/* Column Header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl border ${styles.header} mb-1`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
          <span className="text-sm font-semibold text-gray-700">{status}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles.count}`}>
          {initiatives.length}
        </span>
      </div>

      {/* Droppable Cards Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 rounded-b-xl border border-t-0 border-gray-200 p-2 overflow-y-auto
              transition-colors duration-150 min-h-[400px]
              ${snapshot.isDraggingOver ? styles.droppableOver : styles.droppable}
            `}
          >
            {initiatives.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <svg className="h-8 w-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-xs text-gray-400">Sin iniciativas en este estado</p>
              </div>
            )}

            {initiatives.map((initiative, index) => (
              <KanbanCard
                key={initiative.id}
                initiative={initiative}
                index={index}
              />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export default KanbanColumn

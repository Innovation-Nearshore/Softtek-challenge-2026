import { Draggable } from '@hello-pangea/dnd'
import Badge from '../atoms/Badge'

/**
 * Molecule: KanbanCard
 * Represents a single initiative card on the Kanban board.
 * Wraps @hello-pangea/dnd Draggable.
 */
const KanbanCard = ({ initiative, index }) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = new Date(initiative.fecha_limite)
  deadline.setHours(0, 0, 0, 0)
  const isOverdue =
    deadline < today && initiative.estado !== 'Completado'
  const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
  const isUrgent = daysUntil >= 0 && daysUntil <= 3 && initiative.estado !== 'Completado'

  const formattedDate = new Date(initiative.fecha_limite).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Draggable draggableId={String(initiative.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            bg-white rounded-lg border shadow-sm p-3 mb-2 cursor-grab select-none
            transition-shadow duration-150
            ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400 rotate-1 cursor-grabbing' : 'hover:shadow-md'}
            ${isOverdue ? 'border-l-4 border-l-red-500' : isUrgent ? 'border-l-4 border-l-amber-400' : 'border-gray-200'}
          `}
        >
          {/* Header row: priority badge + overdue pill */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge priority={initiative.prioridad} />
            {isOverdue && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                Vencida
              </span>
            )}
            {isUrgent && !isOverdue && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                {daysUntil === 0 ? 'Hoy' : `${daysUntil}d`}
              </span>
            )}
          </div>

          {/* Initiative name */}
          <p className="text-sm font-semibold text-gray-800 leading-snug mb-1 line-clamp-2">
            {initiative.nombre}
          </p>

          {/* Responsible */}
          <div className="flex items-center gap-1 mb-2">
            <svg className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs text-gray-500 truncate">{initiative.responsable}</span>
          </div>

          {/* Footer: deadline */}
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
          </div>
        </div>
      )}
    </Draggable>
  )
}

export default KanbanCard

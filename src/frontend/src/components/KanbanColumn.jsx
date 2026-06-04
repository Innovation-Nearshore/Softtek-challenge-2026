import { Droppable } from '@hello-pangea/dnd'
import KanbanCard from './KanbanCard'
import styles from './KanbanColumn.module.css'

const COLUMN_META = {
  Pendiente:  { emoji: '🕐', colorClass: 'pending' },
  'En curso': { emoji: '⚡', colorClass: 'inprogress' },
  Completado: { emoji: '✅', colorClass: 'completed' },
}

export default function KanbanColumn({ status, initiatives, onDelete }) {
  const meta = COLUMN_META[status] ?? { emoji: '📋', colorClass: 'default' }

  return (
    <div className={`${styles.column} ${styles[meta.colorClass]}`}>
      <div className={styles.columnHeader}>
        <span className={styles.emoji}>{meta.emoji}</span>
        <h3 className={styles.columnTitle}>{status}</h3>
        <span className={styles.badge}>{initiatives.length}</span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={[
              styles.dropZone,
              snapshot.isDraggingOver ? styles.draggingOver : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {initiatives.map((initiative, index) => (
              <KanbanCard
                key={initiative.id}
                initiative={initiative}
                index={index}
                onDelete={onDelete}
              />
            ))}

            {provided.placeholder}

            {initiatives.length === 0 && !snapshot.isDraggingOver && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📭</span>
                <p>Sin iniciativas</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}

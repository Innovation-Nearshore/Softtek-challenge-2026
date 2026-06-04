import { Draggable } from '@hello-pangea/dnd'
import { useNavigate } from 'react-router-dom'
import { PriorityBadge } from './StatusBadge'
import styles from './KanbanCard.module.css'

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'Completado') return false
  return new Date(dateStr) < new Date()
}

export default function KanbanCard({ initiative, index, onDelete }) {
  const navigate = useNavigate()
  const overdue = isOverdue(initiative.deadline, initiative.status)

  return (
    <Draggable draggableId={String(initiative.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={[
            styles.card,
            snapshot.isDragging ? styles.dragging : '',
            overdue ? styles.overdue : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={`Iniciativa: ${initiative.name}`}
        >
          <div className={styles.cardHeader}>
            <span className={styles.name}>{initiative.name}</span>
            <PriorityBadge priority={initiative.priority} />
          </div>

          {initiative.responsible && (
            <div className={styles.responsible}>
              <span className={styles.icon}>👤</span>
              {initiative.responsible}
            </div>
          )}

          {initiative.deadline && (
            <div className={[styles.deadline, overdue ? styles.overdueDate : ''].filter(Boolean).join(' ')}>
              <span className={styles.icon}>{overdue ? '⚠' : '📅'}</span>
              {formatDate(initiative.deadline)}
              {overdue && <span className={styles.overdueLabel}> · Vencida</span>}
            </div>
          )}

          {initiative.description && (
            <p className={styles.description}>{initiative.description}</p>
          )}

          <div className={styles.actions}>
            <button
              className={styles.btnEdit}
              onClick={() => navigate(`/editar/${initiative.id}`)}
              aria-label={`Editar ${initiative.name}`}
            >
              ✏️
            </button>
            <button
              className={styles.btnDelete}
              onClick={() => onDelete(initiative.id, initiative.name)}
              aria-label={`Eliminar ${initiative.name}`}
            >
              🗑
            </button>
          </div>
        </div>
      )}
    </Draggable>
  )
}

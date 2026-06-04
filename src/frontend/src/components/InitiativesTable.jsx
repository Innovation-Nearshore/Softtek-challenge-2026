import { useNavigate } from 'react-router-dom'
import { StatusBadge, PriorityBadge } from './StatusBadge'
import styles from './InitiativesTable.module.css'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'Completado') return false
  return new Date(dateStr) < new Date()
}

export default function InitiativesTable({ initiatives, onDelete, loading }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className={styles.empty}>
        <span className={styles.spinner} aria-label="Cargando..." />
        <p>Cargando iniciativas…</p>
      </div>
    )
  }

  if (!initiatives.length) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📭</span>
        <p>No hay iniciativas que mostrar.</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table} role="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Responsable</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Fecha límite</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {initiatives.map((item) => (
            <tr
              key={item.id}
              className={isOverdue(item.deadline, item.status) ? styles.overdue : ''}
            >
              <td>
                <span className={styles.name}>{item.name}</span>
                {isOverdue(item.deadline, item.status) && (
                  <span className={styles.overdueTag} title="Iniciativa vencida">⚠ Vencida</span>
                )}
              </td>
              <td>{item.responsible}</td>
              <td><StatusBadge status={item.status} /></td>
              <td><PriorityBadge priority={item.priority} /></td>
              <td>{formatDate(item.deadline)}</td>
              <td>
                <div className={styles.actions}>
                  <button
                    className={styles.btnEdit}
                    onClick={() => navigate(`/editar/${item.id}`)}
                    aria-label={`Editar ${item.name}`}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className={styles.btnDelete}
                    onClick={() => onDelete(item.id, item.name)}
                    aria-label={`Eliminar ${item.name}`}
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

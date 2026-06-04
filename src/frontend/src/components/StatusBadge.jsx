import styles from './StatusBadge.module.css'

const STATUS_MAP = {
  Pendiente: 'pending',
  'En curso': 'inprogress',
  Completado: 'completed',
}

const PRIORITY_MAP = {
  Alta: 'high',
  Media: 'medium',
  Baja: 'low',
}

export function StatusBadge({ status }) {
  const key = STATUS_MAP[status] ?? 'pending'
  return <span className={`${styles.badge} ${styles[key]}`}>{status}</span>
}

export function PriorityBadge({ priority }) {
  const key = PRIORITY_MAP[priority] ?? 'medium'
  return <span className={`${styles.badge} ${styles[key]}`}>{priority}</span>
}

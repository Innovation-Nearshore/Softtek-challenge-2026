import styles from './StatsCards.module.css'

const CARDS = [
  { key: 'total', label: 'Total', icon: '📋', colorClass: 'total' },
  { key: 'pending', label: 'Pendiente', icon: '⏳', colorClass: 'pending' },
  { key: 'in_progress', label: 'En curso', icon: '🔄', colorClass: 'inprogress' },
  { key: 'completed', label: 'Completado', icon: '✅', colorClass: 'completed' },
]

export default function StatsCards({ stats, onFilter, activeFilter }) {
  return (
    <div className={styles.grid}>
      {CARDS.map(({ key, label, icon, colorClass }) => {
        const filterValue = key === 'total' ? 'all' : label
        const isActive = activeFilter === filterValue
        return (
          <button
            key={key}
            className={`${styles.card} ${styles[colorClass]} ${isActive ? styles.activeCard : ''}`}
            onClick={() => onFilter(filterValue)}
            aria-pressed={isActive}
            title={`Filtrar por: ${label}`}
          >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.count}>{stats[key] ?? 0}</span>
            <span className={styles.label}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

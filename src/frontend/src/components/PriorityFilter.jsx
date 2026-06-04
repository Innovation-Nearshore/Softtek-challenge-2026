import styles from './PriorityFilter.module.css'

const PRIORITIES = [
  { value: 'all',  label: 'Todas' },
  { value: 'Alta', label: '🔴 Alta' },
  { value: 'Media', label: '🟡 Media' },
  { value: 'Baja', label: '🟢 Baja' },
]

export default function PriorityFilter({ activePriority, onFilter }) {
  return (
    <div className={styles.container} role="group" aria-label="Filtrar por prioridad">
      <span className={styles.label}>Prioridad:</span>
      {PRIORITIES.map(({ value, label }) => (
        <button
          key={value}
          className={`${styles.btn} ${activePriority === value ? styles.active : ''} ${value !== 'all' ? styles[value.toLowerCase()] : ''}`}
          onClick={() => onFilter(value)}
          aria-pressed={activePriority === value}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

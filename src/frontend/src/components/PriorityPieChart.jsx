import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import styles from './PriorityPieChart.module.css'

const PRIORITY_COLORS = {
  Alta: '#ef4444',
  Media: '#f59e0b',
  Baja: '#22c55e',
}

const PRIORITY_LABELS = {
  Alta: 'Alta',
  Media: 'Media',
  Baja: 'Baja',
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  if (percentage < 5) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight="700"
    >
      {`${percentage}%`}
    </text>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { priority, count, percentage } = payload[0].payload
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{PRIORITY_LABELS[priority] ?? priority}</p>
      <p className={styles.tooltipLine}>
        <span className={styles.tooltipDot} style={{ background: PRIORITY_COLORS[priority] ?? '#6b7280' }} />
        {count} iniciativa{count !== 1 ? 's' : ''} — {percentage}%
      </p>
    </div>
  )
}

export default function PriorityPieChart({ distribution = [], total = 0 }) {
  if (!distribution.length) {
    return (
      <div className={styles.empty}>
        <span>Sin datos de prioridad</span>
      </div>
    )
  }

  const data = distribution.map((d) => ({
    ...d,
    name: PRIORITY_LABELS[d.priority] ?? d.priority,
    fill: PRIORITY_COLORS[d.priority] ?? '#6b7280',
  }))

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Distribución por Prioridad</h2>
      <p className={styles.subtitle}>{total} iniciativa{total !== 1 ? 's' : ''} en total</p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={110}
            dataKey="count"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((entry) => (
              <Cell key={entry.priority} fill={entry.fill} stroke="#fff" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value, entry) => (
              <span className={styles.legendLabel}>
                {value}
                <span className={styles.legendMeta}>
                  {entry.payload.count} ({entry.payload.percentage}%)
                </span>
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

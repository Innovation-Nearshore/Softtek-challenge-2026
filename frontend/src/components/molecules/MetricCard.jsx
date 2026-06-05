/**
 * Molecule: MetricCard
 * Displays a single KPI metric with title, value, subtitle and optional color accent.
 */
const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  accent = 'blue',
  className = '',
}) => {
  const accents = {
    blue: 'border-l-blue-500 bg-blue-50',
    green: 'border-l-green-500 bg-green-50',
    red: 'border-l-red-500 bg-red-50',
    yellow: 'border-l-yellow-500 bg-yellow-50',
    orange: 'border-l-orange-500 bg-orange-50',
    purple: 'border-l-purple-500 bg-purple-50',
  }

  const valueColors = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    red: 'text-red-700',
    yellow: 'text-yellow-700',
    orange: 'text-orange-700',
    purple: 'text-purple-700',
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 p-5 flex items-start gap-4 ${accents[accent]} ${className}`}
    >
      {icon && (
        <div className="flex-shrink-0 text-2xl">{icon}</div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${valueColors[accent]}`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

export default MetricCard

/**
 * Atom: Badge
 * Displays a colored label for statuses and priorities.
 */

const STATUS_STYLES = {
  Pendiente: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  'En curso': 'bg-blue-100 text-blue-800 border border-blue-300',
  Completado: 'bg-green-100 text-green-800 border border-green-300',
}

const PRIORITY_STYLES = {
  Alta: 'bg-red-100 text-red-800 border border-red-300',
  Media: 'bg-orange-100 text-orange-800 border border-orange-300',
  Baja: 'bg-gray-100 text-gray-700 border border-gray-300',
}

const GENERIC_STYLES = {
  default: 'bg-gray-100 text-gray-700 border border-gray-300',
  info: 'bg-blue-100 text-blue-800 border border-blue-300',
  success: 'bg-green-100 text-green-800 border border-green-300',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  danger: 'bg-red-100 text-red-800 border border-red-300',
}

/**
 * @param {string} type - 'status' | 'priority' | 'generic'
 * @param {string} value - The display value and style key
 * @param {string} variant - Used when type='generic': 'default'|'info'|'success'|'warning'|'danger'
 */
const Badge = ({ type = 'generic', value, variant = 'default', className = '' }) => {
  let styleClass = ''

  if (type === 'status') {
    styleClass = STATUS_STYLES[value] || GENERIC_STYLES.default
  } else if (type === 'priority') {
    styleClass = PRIORITY_STYLES[value] || GENERIC_STYLES.default
  } else {
    styleClass = GENERIC_STYLES[variant] || GENERIC_STYLES.default
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styleClass} ${className}`}
    >
      {value}
    </span>
  )
}

export default Badge

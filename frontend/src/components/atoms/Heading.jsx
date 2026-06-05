/**
 * Atom: Heading
 * Typography heading component with configurable level.
 */
const Heading = ({ level = 1, children, className = '' }) => {
  const Tag = `h${level}`
  const sizes = {
    1: 'text-2xl font-bold text-gray-900',
    2: 'text-xl font-bold text-gray-900',
    3: 'text-lg font-semibold text-gray-800',
    4: 'text-base font-semibold text-gray-800',
    5: 'text-sm font-semibold text-gray-700',
    6: 'text-xs font-semibold text-gray-600',
  }

  return <Tag className={`${sizes[level]} ${className}`}>{children}</Tag>
}

export default Heading

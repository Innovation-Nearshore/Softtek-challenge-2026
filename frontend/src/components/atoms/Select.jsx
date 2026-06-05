/**
 * Atom: Select
 * Single-responsibility dropdown select component.
 */
const Select = ({
  id,
  value,
  onChange,
  disabled = false,
  error = false,
  className = '',
  children,
  ...props
}) => {
  const base =
    'w-full px-3 py-2 text-sm border rounded-lg bg-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none cursor-pointer'
  const stateClasses = error
    ? 'border-red-400 focus:ring-red-400 text-red-900'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900'
  const disabledClasses = disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''

  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${base} ${stateClasses} ${disabledClasses} pr-8 ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export default Select

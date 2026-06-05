/**
 * Atom: Input
 * Single-responsibility text input component.
 */
const Input = ({
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  error = false,
  className = '',
  ...props
}) => {
  const base =
    'w-full px-3 py-2 text-sm border rounded-lg bg-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0'
  const stateClasses = error
    ? 'border-red-400 focus:ring-red-400 text-red-900 placeholder-red-300'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400'
  const disabledClasses = disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''

  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${base} ${stateClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  )
}

export default Input

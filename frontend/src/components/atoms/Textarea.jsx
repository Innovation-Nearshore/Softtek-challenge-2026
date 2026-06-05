/**
 * Atom: Textarea
 * Single-responsibility multiline text input component.
 */
const Textarea = ({
  id,
  placeholder = '',
  value,
  onChange,
  disabled = false,
  error = false,
  rows = 3,
  className = '',
  ...props
}) => {
  const base =
    'w-full px-3 py-2 text-sm border rounded-lg bg-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none'
  const stateClasses = error
    ? 'border-red-400 focus:ring-red-400 text-red-900 placeholder-red-300'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400'
  const disabledClasses = disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''

  return (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={rows}
      className={`${base} ${stateClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  )
}

export default Textarea

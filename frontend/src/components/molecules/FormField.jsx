import Label from '../atoms/Label'
import ErrorMessage from '../atoms/ErrorMessage'

/**
 * Molecule: FormField
 * Composes Label + input element + ErrorMessage into a single form field unit.
 */
const FormField = ({ id, label, required = false, error, children, className = '' }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {children}
      <ErrorMessage message={error} />
    </div>
  )
}

export default FormField

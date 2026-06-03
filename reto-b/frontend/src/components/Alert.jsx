export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null
  const styles = {
    error: 'bg-red-50 border-red-400 text-red-700',
    success: 'bg-green-50 border-green-400 text-green-700',
    info: 'bg-blue-50 border-blue-400 text-blue-700',
  }
  return (
    <div className={`border-l-4 px-4 py-3 rounded flex items-start justify-between gap-4 ${styles[type]}`}>
      <p className="text-sm">{message}</p>
      {onClose && (
        <button onClick={onClose} className="text-lg leading-none opacity-60 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  )
}

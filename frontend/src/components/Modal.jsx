/**
 * Generic Modal wrapper.
 * Props:
 *   isOpen   – boolean
 *   onClose  – callback
 *   title    – string
 *   children – modal body content
 *   wide     – boolean (use wider max-width)
 */
export default function Modal({ isOpen, onClose, title, children, wide = false }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] w-full mx-4 ${
          wide ? 'max-w-4xl' : 'max-w-lg'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-600 text-2xl leading-none transition-colors"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

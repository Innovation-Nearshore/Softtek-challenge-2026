import { useEffect } from 'react';

/**
 * Popup/Toast notification.
 * Props:
 *   message  – string to display
 *   type     – 'success' | 'error'
 *   onClose  – callback to clear the message
 *   duration – ms before auto-dismiss (default 4000)
 */
export default function Popup({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const base =
    'fixed top-5 right-5 z-50 flex items-start gap-3 rounded-lg px-5 py-4 shadow-lg max-w-sm w-full text-sm font-medium';
  const variants = {
    success: 'bg-green-50 border border-green-300 text-green-800',
    error: 'bg-red-50 border border-red-400 text-red-800',
  };

  return (
    <div className={`${base} ${variants[type] ?? variants.error}`} role="alert">
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto shrink-0 text-lg leading-none opacity-60 hover:opacity-100"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
}

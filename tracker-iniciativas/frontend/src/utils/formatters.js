/**
 * formatters.js
 * Utility functions for date formatting, status/priority color mapping,
 * and badge helpers used across dashboard and form components.
 */

/**
 * Format an ISO date string to a human-readable Spanish locale date.
 * @param {string|null} dateStr - ISO date string (e.g. "2025-12-31")
 * @returns {string} Formatted date string (e.g. "31/12/2025") or "Sin fecha"
 */
export const formatFecha = (dateStr) => {
  if (!dateStr) return 'Sin fecha';
  // If dateStr is already a full ISO timestamp (contains 'T'), parse directly.
  // If it's just a YYYY-MM-DD string, append T00:00:00 to prevent UTC timezone shift.
  const normalized = String(dateStr).includes('T')
    ? dateStr
    : dateStr + 'T00:00:00';
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// ─── Estado (Status) Helpers ────────────────────────────────────────────────

/**
 * Returns Tailwind CSS classes for a status badge background/text.
 * @param {string} estado
 * @returns {string} Tailwind class string
 */
export const getEstadoClasses = (estado) => {
  switch (estado) {
    case 'Completado':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'En curso':
      return 'bg-blue-100 text-blue-800 border border-blue-300';
    case 'Pendiente':
    default:
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
  }
};

/**
 * Returns a color hex or Tailwind accent color name for chart/counter cards.
 * @param {string} estado
 * @returns {string}
 */
export const getEstadoColor = (estado) => {
  switch (estado) {
    case 'Completado':
      return 'green';
    case 'En curso':
      return 'blue';
    case 'Pendiente':
    default:
      return 'yellow';
  }
};

// ─── Prioridad (Priority) Helpers ────────────────────────────────────────────

/**
 * Returns Tailwind CSS classes for a priority badge.
 * @param {string} prioridad
 * @returns {string} Tailwind class string
 */
export const getPrioridadClasses = (prioridad) => {
  switch (prioridad) {
    case 'Alta':
      return 'bg-red-100 text-red-800 border border-red-300';
    case 'Media':
      return 'bg-orange-100 text-orange-800 border border-orange-300';
    case 'Baja':
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-300';
  }
};

/**
 * Returns a color name for priority counter cards.
 * @param {string} prioridad
 * @returns {string}
 */
export const getPrioridadColor = (prioridad) => {
  switch (prioridad) {
    case 'Alta':
      return 'red';
    case 'Media':
      return 'orange';
    case 'Baja':
    default:
      return 'gray';
  }
};

// ─── Constants ───────────────────────────────────────────────────────────────

export const ESTADOS = ['Pendiente', 'En curso', 'Completado'];
export const PRIORIDADES = ['Alta', 'Media', 'Baja'];

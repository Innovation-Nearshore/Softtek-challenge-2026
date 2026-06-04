/**
 * Shared date utility functions.
 * Centralises date formatting logic used across Dashboard and KanbanBoard
 * to avoid code duplication.
 */

/**
 * Formats a date string as a localised date using the es-PE locale.
 * Returns an em-dash when the value is absent.
 *
 * @param {string|null|undefined} dateStr - ISO date string (e.g. "2025-12-31")
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-PE');
}

/**
 * Calculates the number of whole days from today until the given date.
 * Returns Infinity when the value is absent so missing dates are never
 * treated as overdue.
 *
 * @param {string|null|undefined} dateStr - ISO date string
 * @returns {number}
 */
export function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

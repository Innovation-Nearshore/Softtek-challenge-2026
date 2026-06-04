/**
 * iniciativasService.js
 * Frontend service layer — ONLY consumes Express BFF endpoints (/api/...)
 * Never calls PostgREST directly.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * Generic fetch wrapper with consistent error handling
 * @param {string} path - URL path relative to BASE_URL
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
const apiFetch = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorBody;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { error: response.statusText };
    }
    const message = errorBody?.error || `Error HTTP ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.body = errorBody;
    throw err;
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  return response.json();
};

/**
 * Fetch all iniciativas (no filters)
 * @returns {Promise<Array>}
 */
export const getIniciativas = () => apiFetch('/api/iniciativas');

/**
 * Create a new iniciativa
 * @param {Object} data - { nombre, responsable, estado, fecha_limite, prioridad, descripcion }
 * @returns {Promise<Object>} Created iniciativa
 */
export const createIniciativa = (data) =>
  apiFetch('/api/iniciativas', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Fetch iniciativas filtered by estado
 * @param {string} estado - 'Pendiente' | 'En curso' | 'Completado'
 * @returns {Promise<Array>}
 */
export const getByEstado = (estado) =>
  apiFetch(`/api/iniciativas?estado=${encodeURIComponent(estado)}`);

/**
 * Fetch iniciativas filtered by prioridad
 * @param {string} prioridad - 'Alta' | 'Media' | 'Baja'
 * @returns {Promise<Array>}
 */
export const getByPrioridad = (prioridad) =>
  apiFetch(`/api/iniciativas?prioridad=${encodeURIComponent(prioridad)}`);

/**
 * Fetch iniciativas filtered by both estado and prioridad
 * @param {string} estado
 * @param {string} prioridad
 * @returns {Promise<Array>}
 */
export const getByFilters = (estado, prioridad) => {
  const params = new URLSearchParams();
  if (estado) params.append('estado', estado);
  if (prioridad) params.append('prioridad', prioridad);
  return apiFetch(`/api/iniciativas?${params.toString()}`);
};

/**
 * Update an existing iniciativa by ID
 * @param {number|string} id
 * @param {Object} data - Partial fields to update
 * @returns {Promise<Object>} Updated iniciativa
 */
export const updateIniciativa = (id, data) =>
  apiFetch(`/api/iniciativas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

/**
 * Fetch iniciativas whose fecha_limite is within the next `days` calendar days.
 * Excludes completed initiatives. Ordered by fecha_limite ASC.
 * @param {number} days - Look-ahead window (default 7)
 * @returns {Promise<Array>}
 */
export const getProximosVencimientos = (days = 7) =>
  apiFetch(`/api/iniciativas/proximos-vencimientos?days=${days}`);

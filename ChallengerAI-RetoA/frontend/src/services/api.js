import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Iniciativas ──────────────────────────────────────────────────────────────

export const getIniciativas = (estado = '', prioridad = '') => {
  const params = {};
  if (estado) params.estado = estado;
  if (prioridad) params.prioridad = prioridad;
  return api.get('/iniciativas', { params });
};

export const getIniciativa = (id) => api.get(`/iniciativas/${id}`);

export const createIniciativa = (data) => api.post('/iniciativas', data);

export const updateIniciativa = (id, data) => api.put(`/iniciativas/${id}`, data);

export const deleteIniciativa = (id) => api.delete(`/iniciativas/${id}`);

export const getStats = () => api.get('/iniciativas/stats');

export const getProximosVencimientos = () => api.get('/iniciativas/proximos-vencimientos');

export default api;

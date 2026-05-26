import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de respuesta: extrae data.data o lanza error con mensaje claro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Error de conexión con el servidor';
    return Promise.reject(new Error(message));
  }
);

// Helper: extrae el campo data del envelope { success, data, ... }
const extract = (r) => r.data?.data ?? r.data;

// --- Solicitudes ---
export const fetchRequests = (filters = {}) => {
  const params = {};
  if (filters.tipo) params.tipo = filters.tipo;
  if (filters.urgencia) params.urgencia = filters.urgencia;
  if (filters.estado) params.estado = filters.estado;
  return api.get('/solicitudes', { params }).then(extract);
};

export const fetchRequestById = (id) =>
  api.get(`/solicitudes/${id}`).then(extract);

export const createRequest = (data) => {
  // Mapear campos del formulario al formato esperado por el backend
  const payload = {
    tipo: data.tipo,
    urgencia: data.urgencia,
    descripcion: data.descripcion,
    solicitante: data.solicitante,
    area: data.area,
  };
  return api.post('/solicitudes', payload).then(extract);
};

export const updateStatus = (id, estado, comentario = '') =>
  api
    .patch(`/solicitudes/${id}/status`, { estado_nuevo: estado, comentario })
    .then(extract);

// --- Historial ---
export const fetchHistorial = (id) =>
  api.get(`/solicitudes/${id}/historial`).then(extract);

// --- Métricas ---
export const fetchMetricas = () =>
  api.get('/solicitudes/metricas/dashboard').then(extract);

export default api;

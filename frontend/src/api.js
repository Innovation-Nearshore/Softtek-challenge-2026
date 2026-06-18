import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

export const getTipos = () => api.get('/tipos-solicitud');
export const getAreas = () => api.get('/areas');

export const createSolicitud = (data) => api.post('/solicitudes', data);
export const getSolicitudes = (filters = {}) => api.get('/solicitudes', { params: filters });
export const updateEstado = (id, data) => api.patch(`/solicitudes/${id}/estado`, data);
export const getHistorialById = (id) => api.get(`/solicitudes/${id}/historial`);

export const getHistorial = (filters = {}) => api.get('/historial', { params: filters });

export const getMetrics = () => api.get('/metrics');

export default api;

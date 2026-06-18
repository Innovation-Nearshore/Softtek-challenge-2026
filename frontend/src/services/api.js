import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to extract a friendly error message from axios errors
const extractError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Error desconocido';
};

// ─── Lookups ────────────────────────────────────────────────────────────────

export const getAreas = async () => {
  try {
    const { data } = await apiClient.get('/areas');
    return { data, error: null };
  } catch (error) {
    return { data: null, error: extractError(error) };
  }
};

export const getTiposSolicitud = async () => {
  try {
    const { data } = await apiClient.get('/tipos-solicitud');
    return { data, error: null };
  } catch (error) {
    return { data: null, error: extractError(error) };
  }
};

// ─── Solicitudes ─────────────────────────────────────────────────────────────

export const getSolicitudes = async (page = 1, limit = 50, responsable = null) => {
  try {
    const params = { page, limit };
    if (responsable) params.responsable = responsable;
    const { data } = await apiClient.get('/solicitudes', { params });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: extractError(error) };
  }
};

export const createSolicitud = async (payload) => {
  try {
    const { data } = await apiClient.post('/solicitudes', payload);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: extractError(error) };
  }
};

export const updateEstado = async (id, estado, responsable = null) => {
  try {
    const payload = { estado };
    if (responsable) payload.responsable = responsable;
    const { data } = await apiClient.patch(`/solicitudes/${id}/estado`, payload);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: extractError(error) };
  }
};

export const getHistorial = async (id) => {
  try {
    const { data } = await apiClient.get(`/solicitudes/${id}/historial`);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: extractError(error) };
  }
};

// ─── Metrics ─────────────────────────────────────────────────────────────────

export const getMetrics = async () => {
  try {
    const { data } = await apiClient.get('/metrics');
    return { data, error: null };
  } catch (error) {
    return { data: null, error: extractError(error) };
  }
};

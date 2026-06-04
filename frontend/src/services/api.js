import axios from 'axios';

// Use relative path so the Vite proxy forwards to http://localhost:3001 in dev,
// and the same origin works in production with a proper reverse proxy.
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — normalise error messages for consumers
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Error de conexión con el servidor';
    return Promise.reject({ ...error, friendlyMessage: message });
  }
);

export const initiativesService = {
  /** Retrieve all initiatives ordered by creation date */
  getAll: () => apiClient.get('/initiatives'),

  /** Retrieve a single initiative by its UUID */
  getById: (id) => apiClient.get(`/initiatives/${id}`),

  /** Create a new initiative — returns { message, initiative } */
  create: (data) => apiClient.post('/initiatives', data),

  /** Full update of an initiative — returns { message, initiative } */
  update: (id, data) => apiClient.put(`/initiatives/${id}`, data),

  /** Update only the status field — returns { message, initiative } */
  updateStatus: (id, estado) =>
    apiClient.patch(`/initiatives/${id}/status`, { estado }),

  /** Delete an initiative by id */
  delete: (id) => apiClient.delete(`/initiatives/${id}`),
};

export default apiClient;

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error status
      return Promise.reject({
        status: error.response.status,
        message: error.response.data?.message || 'Error en la solicitud',
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        status: 0,
        message: 'No hay respuesta del servidor',
        data: null,
      });
    } else {
      // Error setting up request
      return Promise.reject({
        status: 0,
        message: error.message || 'Error desconocido',
        data: null,
      });
    }
  }
);

export default client;

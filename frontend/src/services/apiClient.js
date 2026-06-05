import axios from 'axios'

/**
 * Service: apiClient
 * Configured axios instance for all backend API requests.
 * Single responsibility: HTTP transport configuration.
 */
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for centralized error normalization
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Error de conexión con el servidor'
    return Promise.reject(new Error(message))
  }
)

export default apiClient

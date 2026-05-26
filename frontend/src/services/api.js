import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
}

// Admin - Users endpoints
export const usuariosAPI = {
  getAll: () => api.get('/admin/usuarios'),
  getById: (id) => api.get(`/admin/usuarios/${id}`),
  create: (data) => api.post('/admin/usuarios', data),
  update: (id, data) => api.put(`/admin/usuarios/${id}`, data),
}

// Solicitudes endpoints
export const solicitudesAPI = {
  create: (data) => api.post('/solicitudes', data),
  getBandeja: (params) => api.get('/solicitudes/bandeja', { params }),
  updateEstado: (id, estado) => api.put(`/solicitudes/${id}/estado`, { estado }),
}

export default api

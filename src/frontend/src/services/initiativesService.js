import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Response interceptor – normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'Error de red'
    return Promise.reject(new Error(message))
  }
)

export const getInitiatives = (params = {}) =>
  api.get('/initiatives', { params }).then((r) => r.data)

export const getInitiativeById = (id) =>
  api.get(`/initiatives/${id}`).then((r) => r.data)

export const createInitiative = (data) =>
  api.post('/initiatives', data).then((r) => r.data)

export const updateInitiative = (id, data) =>
  api.put(`/initiatives/${id}`, data).then((r) => r.data)

export const deleteInitiative = (id) =>
  api.delete(`/initiatives/${id}`).then((r) => r.data)

export const getStats = () =>
  api.get('/initiatives/stats').then((r) => r.data)

export const getPriorityStats = () =>
  api.get('/initiatives/stats/priority').then((r) => r.data)

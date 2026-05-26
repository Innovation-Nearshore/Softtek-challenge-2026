import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getSolicitudes = (filters = {}) => {
  const params = {}
  if (filters.urgencia) params.urgencia = filters.urgencia
  if (filters.tipo) params.tipo = filters.tipo
  return api.get('/solicitudes', { params })
}

export const createSolicitud = (data) => {
  return api.post('/solicitudes', data)
}

export const updateEstado = (id, estado, comentario = '', usuario = 'Sistema') => {
  return api.patch(`/solicitudes/${id}/estado`, { estado, comentario, usuario })
}

export const getSolicitudById = (id) => {
  return api.get(`/solicitudes/${id}`)
}

export const getDashboardMetrics = () => {
  return api.get('/solicitudes/dashboard/metrics')
}

export const getTiposSolicitud = () => {
  return api.get('/tipos-solicitud')
}

export const getAreas = () => {
  return api.get('/areas')
}

export default api

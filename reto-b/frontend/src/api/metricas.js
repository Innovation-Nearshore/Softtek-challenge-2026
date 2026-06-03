import client from './client'

// All backend responses are wrapped: { success, data }. Unwrap to .data.data.
export const getMetricas = (params) => client.get('/metricas', { params }).then((r) => r.data.data)
export const getMetricaById = (id) => client.get(`/metricas/${id}`).then((r) => r.data.data)
export const createMetrica = (data) => client.post('/metricas', data).then((r) => r.data.data)
export const updateMetrica = (id, data) => client.put(`/metricas/${id}`, data).then((r) => r.data.data)
export const deleteMetrica = (id) => client.delete(`/metricas/${id}`).then((r) => r.data.data)

// Upload returns { success, inserted, records } (not wrapped in .data)
export const uploadCSV = (file) => {
  const form = new FormData()
  form.append('file', file)
  return client.post('/metricas/upload-csv', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)
}

// Summary returns array of per-category objects
export const getResumen = (params) => client.get('/metricas/resumen', { params }).then((r) => r.data.data)

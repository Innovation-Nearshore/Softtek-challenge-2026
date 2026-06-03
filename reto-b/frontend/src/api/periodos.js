import client from './client'

export const getPeriodos = () => client.get('/periodos').then((r) => r.data.data)
export const getPeriodoById = (id) => client.get(`/periodos/${id}`).then((r) => r.data.data)
export const upsertPeriodo = (data) => client.post('/periodos', data).then((r) => r.data.data)
export const deletePeriodo = (id) => client.delete(`/periodos/${id}`).then((r) => r.data.data)

import client from './client'

export const getCategorias = () => client.get('/categorias').then((r) => r.data.data)
export const getCategoriaById = (id) => client.get(`/categorias/${id}`).then((r) => r.data.data)
export const createCategoria = (data) => client.post('/categorias', data).then((r) => r.data.data)
export const updateCategoria = (id, data) => client.put(`/categorias/${id}`, data).then((r) => r.data.data)
export const deleteCategoria = (id) => client.delete(`/categorias/${id}`).then((r) => r.data.data)

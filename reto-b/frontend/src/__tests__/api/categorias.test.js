import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../api/client.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import client from '../../api/client.js'
import {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from '../../api/categorias.js'

const sampleCategoria = {
  id: 1,
  nombre: 'Ventas',
  descripcion: 'Métricas de ventas',
  color_hex: '#FF5733',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getCategorias', () => {
  it('calls GET /categorias and returns data array', async () => {
    client.get.mockResolvedValueOnce({ data: { data: [sampleCategoria] } })
    const result = await getCategorias()
    expect(client.get).toHaveBeenCalledWith('/categorias')
    expect(result).toEqual([sampleCategoria])
  })

  it('returns empty array when no categories exist', async () => {
    client.get.mockResolvedValueOnce({ data: { data: [] } })
    const result = await getCategorias()
    expect(result).toEqual([])
  })

  it('propagates errors from the client', async () => {
    client.get.mockRejectedValueOnce(new Error('Server error'))
    await expect(getCategorias()).rejects.toThrow('Server error')
  })
})

describe('getCategoriaById', () => {
  it('calls GET /categorias/:id and returns a single category', async () => {
    client.get.mockResolvedValueOnce({ data: { data: sampleCategoria } })
    const result = await getCategoriaById(1)
    expect(client.get).toHaveBeenCalledWith('/categorias/1')
    expect(result).toEqual(sampleCategoria)
  })

  it('propagates not-found errors', async () => {
    client.get.mockRejectedValueOnce(new Error('Categoría no encontrada'))
    await expect(getCategoriaById(999)).rejects.toThrow('Categoría no encontrada')
  })
})

describe('createCategoria', () => {
  it('calls POST /categorias with data and returns created record', async () => {
    client.post.mockResolvedValueOnce({ data: { data: sampleCategoria } })
    const result = await createCategoria({ nombre: 'Ventas', color_hex: '#FF5733' })
    expect(client.post).toHaveBeenCalledWith('/categorias', { nombre: 'Ventas', color_hex: '#FF5733' })
    expect(result).toEqual(sampleCategoria)
  })

  it('propagates conflict errors (duplicate name)', async () => {
    client.post.mockRejectedValueOnce(new Error('Ya existe una categoría con ese nombre'))
    await expect(createCategoria({ nombre: 'Ventas' })).rejects.toThrow(
      'Ya existe una categoría con ese nombre'
    )
  })

  it('propagates validation errors when name is missing', async () => {
    client.post.mockRejectedValueOnce(new Error('nombre es requerido'))
    await expect(createCategoria({})).rejects.toThrow('nombre es requerido')
  })
})

describe('updateCategoria', () => {
  it('calls PUT /categorias/:id with data and returns updated record', async () => {
    const updated = { ...sampleCategoria, nombre: 'Marketing' }
    client.put.mockResolvedValueOnce({ data: { data: updated } })
    const result = await updateCategoria(1, { nombre: 'Marketing' })
    expect(client.put).toHaveBeenCalledWith('/categorias/1', { nombre: 'Marketing' })
    expect(result.nombre).toBe('Marketing')
  })

  it('propagates not-found errors', async () => {
    client.put.mockRejectedValueOnce(new Error('Categoría no encontrada'))
    await expect(updateCategoria(999, {})).rejects.toThrow('Categoría no encontrada')
  })
})

describe('deleteCategoria', () => {
  it('calls DELETE /categorias/:id and returns deleted record', async () => {
    client.delete.mockResolvedValueOnce({ data: { data: sampleCategoria } })
    const result = await deleteCategoria(1)
    expect(client.delete).toHaveBeenCalledWith('/categorias/1')
    expect(result).toEqual(sampleCategoria)
  })

  it('propagates foreign-key constraint errors', async () => {
    client.delete.mockRejectedValueOnce(
      new Error('No se puede eliminar: tiene métricas asociadas')
    )
    await expect(deleteCategoria(1)).rejects.toThrow('No se puede eliminar: tiene métricas asociadas')
  })

  it('propagates not-found errors', async () => {
    client.delete.mockRejectedValueOnce(new Error('Categoría no encontrada'))
    await expect(deleteCategoria(999)).rejects.toThrow('Categoría no encontrada')
  })
})

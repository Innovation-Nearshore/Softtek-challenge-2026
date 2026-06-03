import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the axios client before importing service functions
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
  getMetricas,
  getMetricaById,
  createMetrica,
  updateMetrica,
  deleteMetrica,
  uploadCSV,
  getResumen,
} from '../../api/metricas.js'

const sampleMetrica = {
  id: 1,
  nombre_metrica: 'Ventas',
  valor_actual: 1000,
  valor_objetivo: 1500,
  unidad: 'USD',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getMetricas', () => {
  it('calls GET /metricas with params and returns data', async () => {
    client.get.mockResolvedValueOnce({ data: { data: [sampleMetrica] } })
    const result = await getMetricas({ periodo_id: 1 })
    expect(client.get).toHaveBeenCalledWith('/metricas', { params: { periodo_id: 1 } })
    expect(result).toEqual([sampleMetrica])
  })

  it('calls GET /metricas without params', async () => {
    client.get.mockResolvedValueOnce({ data: { data: [] } })
    const result = await getMetricas()
    expect(client.get).toHaveBeenCalledWith('/metricas', { params: undefined })
    expect(result).toEqual([])
  })

  it('propagates errors from the client', async () => {
    client.get.mockRejectedValueOnce(new Error('Server error'))
    await expect(getMetricas()).rejects.toThrow('Server error')
  })
})

describe('getMetricaById', () => {
  it('calls GET /metricas/:id and returns data', async () => {
    client.get.mockResolvedValueOnce({ data: { data: sampleMetrica } })
    const result = await getMetricaById(1)
    expect(client.get).toHaveBeenCalledWith('/metricas/1')
    expect(result).toEqual(sampleMetrica)
  })

  it('propagates errors when not found', async () => {
    client.get.mockRejectedValueOnce(new Error('Métrica no encontrada'))
    await expect(getMetricaById(999)).rejects.toThrow('Métrica no encontrada')
  })
})

describe('createMetrica', () => {
  it('calls POST /metricas with data and returns created record', async () => {
    client.post.mockResolvedValueOnce({ data: { data: sampleMetrica } })
    const result = await createMetrica(sampleMetrica)
    expect(client.post).toHaveBeenCalledWith('/metricas', sampleMetrica)
    expect(result).toEqual(sampleMetrica)
  })

  it('propagates validation errors', async () => {
    client.post.mockRejectedValueOnce(new Error('nombre_metrica es requerido'))
    await expect(createMetrica({})).rejects.toThrow('nombre_metrica es requerido')
  })
})

describe('updateMetrica', () => {
  it('calls PUT /metricas/:id with data and returns updated record', async () => {
    const updated = { ...sampleMetrica, valor_actual: 2000 }
    client.put.mockResolvedValueOnce({ data: { data: updated } })
    const result = await updateMetrica(1, { valor_actual: 2000 })
    expect(client.put).toHaveBeenCalledWith('/metricas/1', { valor_actual: 2000 })
    expect(result.valor_actual).toBe(2000)
  })

  it('propagates errors when not found', async () => {
    client.put.mockRejectedValueOnce(new Error('Métrica no encontrada'))
    await expect(updateMetrica(999, {})).rejects.toThrow('Métrica no encontrada')
  })
})

describe('deleteMetrica', () => {
  it('calls DELETE /metricas/:id and returns deleted record', async () => {
    client.delete.mockResolvedValueOnce({ data: { data: sampleMetrica } })
    const result = await deleteMetrica(1)
    expect(client.delete).toHaveBeenCalledWith('/metricas/1')
    expect(result).toEqual(sampleMetrica)
  })

  it('propagates errors when not found', async () => {
    client.delete.mockRejectedValueOnce(new Error('Métrica no encontrada'))
    await expect(deleteMetrica(999)).rejects.toThrow('Métrica no encontrada')
  })
})

describe('uploadCSV', () => {
  it('calls POST /metricas/upload-csv with FormData and returns response data', async () => {
    const mockResponse = { success: true, inserted: 5, records: [] }
    client.post.mockResolvedValueOnce({ data: mockResponse })

    const file = new File(['col1,col2\n1,2'], 'test.csv', { type: 'text/csv' })
    const result = await uploadCSV(file)

    expect(client.post).toHaveBeenCalledWith(
      '/metricas/upload-csv',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
    )
    expect(result).toEqual(mockResponse)
  })

  it('propagates errors on bad CSV', async () => {
    client.post.mockRejectedValueOnce(new Error('Archivo CSV inválido'))
    const file = new File(['bad'], 'bad.csv', { type: 'text/csv' })
    await expect(uploadCSV(file)).rejects.toThrow('Archivo CSV inválido')
  })
})

describe('getResumen', () => {
  it('calls GET /metricas/resumen with params and returns data array', async () => {
    const summary = [{ categoria: 'Ventas', total: 5 }]
    client.get.mockResolvedValueOnce({ data: { data: summary } })
    const result = await getResumen({ anio: 2024 })
    expect(client.get).toHaveBeenCalledWith('/metricas/resumen', { params: { anio: 2024 } })
    expect(result).toEqual(summary)
  })

  it('propagates errors from the client', async () => {
    client.get.mockRejectedValueOnce(new Error('Error de servidor'))
    await expect(getResumen()).rejects.toThrow('Error de servidor')
  })
})

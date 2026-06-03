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
  getPeriodos,
  getPeriodoById,
  upsertPeriodo,
  deletePeriodo,
} from '../../api/periodos.js'

const samplePeriodo = {
  id: 1,
  anio: 2024,
  mes: 1,
  nombre_mes: 'Enero',
  trimestre: 1,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getPeriodos', () => {
  it('calls GET /periodos and returns data array', async () => {
    client.get.mockResolvedValueOnce({ data: { data: [samplePeriodo] } })
    const result = await getPeriodos()
    expect(client.get).toHaveBeenCalledWith('/periodos')
    expect(result).toEqual([samplePeriodo])
  })

  it('returns empty array when no periods exist', async () => {
    client.get.mockResolvedValueOnce({ data: { data: [] } })
    const result = await getPeriodos()
    expect(result).toEqual([])
  })

  it('propagates errors from the client', async () => {
    client.get.mockRejectedValueOnce(new Error('Server error'))
    await expect(getPeriodos()).rejects.toThrow('Server error')
  })
})

describe('getPeriodoById', () => {
  it('calls GET /periodos/:id and returns a single period', async () => {
    client.get.mockResolvedValueOnce({ data: { data: samplePeriodo } })
    const result = await getPeriodoById(1)
    expect(client.get).toHaveBeenCalledWith('/periodos/1')
    expect(result).toEqual(samplePeriodo)
  })

  it('propagates not-found errors', async () => {
    client.get.mockRejectedValueOnce(new Error('Período no encontrado'))
    await expect(getPeriodoById(999)).rejects.toThrow('Período no encontrado')
  })
})

describe('upsertPeriodo', () => {
  it('calls POST /periodos with data and returns the upserted period', async () => {
    client.post.mockResolvedValueOnce({ data: { data: samplePeriodo } })
    const result = await upsertPeriodo(samplePeriodo)
    expect(client.post).toHaveBeenCalledWith('/periodos', samplePeriodo)
    expect(result).toEqual(samplePeriodo)
  })

  it('propagates validation errors', async () => {
    client.post.mockRejectedValueOnce(new Error('anio es requerido'))
    await expect(upsertPeriodo({})).rejects.toThrow('anio es requerido')
  })
})

describe('deletePeriodo', () => {
  it('calls DELETE /periodos/:id and returns deleted period', async () => {
    client.delete.mockResolvedValueOnce({ data: { data: samplePeriodo } })
    const result = await deletePeriodo(1)
    expect(client.delete).toHaveBeenCalledWith('/periodos/1')
    expect(result).toEqual(samplePeriodo)
  })

  it('propagates not-found errors', async () => {
    client.delete.mockRejectedValueOnce(new Error('Período no encontrado'))
    await expect(deletePeriodo(999)).rejects.toThrow('Período no encontrado')
  })
})

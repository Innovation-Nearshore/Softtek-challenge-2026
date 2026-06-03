import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

vi.mock('../../api/metricas.js', () => ({
  getMetricas: vi.fn(),
  getMetricaById: vi.fn(),
  createMetrica: vi.fn(),
  updateMetrica: vi.fn(),
  deleteMetrica: vi.fn(),
  uploadCSV: vi.fn(),
  getResumen: vi.fn(),
}))

import {
  getMetricas,
  getMetricaById,
  createMetrica,
  updateMetrica,
  deleteMetrica,
  uploadCSV,
  getResumen,
} from '../../api/metricas.js'
import { useMetricas, useResumen } from '../../hooks/useMetricas.js'

const sampleMetricas = [
  { id: 1, nombre_metrica: 'Ventas totales', valor_actual: 1000, valor_objetivo: 1500, unidad: 'USD' },
  { id: 2, nombre_metrica: 'Nuevos clientes', valor_actual: 50, valor_objetivo: 100, unidad: 'unidades' },
]

beforeEach(() => {
  vi.clearAllMocks()
})

// ──────────────────────────────────────────────────────────────────────
// useMetricas
// ──────────────────────────────────────────────────────────────────────

describe('useMetricas – initial fetch', () => {
  it('starts with loading true and fetches metricas on mount', async () => {
    getMetricas.mockResolvedValueOnce(sampleMetricas)
    const { result } = renderHook(() => useMetricas())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.metricas).toEqual(sampleMetricas)
    expect(result.current.error).toBe('')
    expect(getMetricas).toHaveBeenCalledWith({})
  })

  it('passes filters to getMetricas', async () => {
    getMetricas.mockResolvedValueOnce([sampleMetricas[0]])
    const { result } = renderHook(() => useMetricas({ periodo_id: 1, categoria_id: 2 }))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(getMetricas).toHaveBeenCalledWith({ periodo_id: 1, categoria_id: 2 })
    expect(result.current.metricas).toEqual([sampleMetricas[0]])
  })

  it('sets error when fetch fails', async () => {
    getMetricas.mockRejectedValueOnce(new Error('Fetch failed'))
    const { result } = renderHook(() => useMetricas())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Fetch failed')
    expect(result.current.metricas).toEqual([])
  })
})

describe('useMetricas – getOne', () => {
  it('calls getMetricaById and returns the metric', async () => {
    getMetricas.mockResolvedValueOnce(sampleMetricas)
    getMetricaById.mockResolvedValueOnce(sampleMetricas[0])

    const { result } = renderHook(() => useMetricas())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let metric
    await act(async () => {
      metric = await result.current.getOne(1)
    })

    expect(getMetricaById).toHaveBeenCalledWith(1)
    expect(metric).toEqual(sampleMetricas[0])
  })
})

describe('useMetricas – save (create)', () => {
  it('calls createMetrica when id is null, sets success, and refreshes', async () => {
    getMetricas.mockResolvedValue(sampleMetricas)
    createMetrica.mockResolvedValueOnce(sampleMetricas[0])

    const { result } = renderHook(() => useMetricas())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.save(null, { nombre_metrica: 'Ventas totales' })
    })

    expect(createMetrica).toHaveBeenCalledWith({ nombre_metrica: 'Ventas totales' })
    expect(updateMetrica).not.toHaveBeenCalled()
    expect(result.current.success).toBe('Métrica creada.')
    expect(getMetricas).toHaveBeenCalledTimes(2)
  })

  it('propagates create errors', async () => {
    getMetricas.mockResolvedValue(sampleMetricas)
    createMetrica.mockRejectedValueOnce(new Error('Validation failed'))

    const { result } = renderHook(() => useMetricas())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => { await result.current.save(null, {}) })
    ).rejects.toThrow('Validation failed')
  })
})

describe('useMetricas – save (update)', () => {
  it('calls updateMetrica when id is provided, sets success, and refreshes', async () => {
    getMetricas.mockResolvedValue(sampleMetricas)
    updateMetrica.mockResolvedValueOnce({ ...sampleMetricas[0], valor_actual: 2000 })

    const { result } = renderHook(() => useMetricas())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.save(1, { valor_actual: 2000 })
    })

    expect(updateMetrica).toHaveBeenCalledWith(1, { valor_actual: 2000 })
    expect(createMetrica).not.toHaveBeenCalled()
    expect(result.current.success).toBe('Métrica actualizada.')
    expect(getMetricas).toHaveBeenCalledTimes(2)
  })
})

describe('useMetricas – remove', () => {
  it('calls deleteMetrica, sets success, and refreshes', async () => {
    getMetricas.mockResolvedValue(sampleMetricas)
    deleteMetrica.mockResolvedValueOnce(sampleMetricas[0])

    const { result } = renderHook(() => useMetricas())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.remove(1)
    })

    expect(deleteMetrica).toHaveBeenCalledWith(1)
    expect(result.current.success).toBe('Métrica eliminada.')
    expect(getMetricas).toHaveBeenCalledTimes(2)
  })

  it('propagates delete errors', async () => {
    getMetricas.mockResolvedValue(sampleMetricas)
    deleteMetrica.mockRejectedValueOnce(new Error('Not found'))

    const { result } = renderHook(() => useMetricas())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => { await result.current.remove(999) })
    ).rejects.toThrow('Not found')
  })
})

describe('useMetricas – importCSV', () => {
  it('calls uploadCSV, formats success message with inserted count, and refreshes', async () => {
    getMetricas.mockResolvedValue(sampleMetricas)
    uploadCSV.mockResolvedValueOnce({ success: true, inserted: 7 })

    const { result } = renderHook(() => useMetricas())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const file = new File(['data'], 'test.csv', { type: 'text/csv' })
    let importResult
    await act(async () => {
      importResult = await result.current.importCSV(file)
    })

    expect(uploadCSV).toHaveBeenCalledWith(file)
    expect(result.current.success).toBe('CSV importado: 7 registros.')
    expect(importResult).toEqual({ success: true, inserted: 7 })
    expect(getMetricas).toHaveBeenCalledTimes(2)
  })

  it('uses count field when inserted is absent', async () => {
    getMetricas.mockResolvedValue(sampleMetricas)
    uploadCSV.mockResolvedValueOnce({ success: true, count: 3 })

    const { result } = renderHook(() => useMetricas())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const file = new File(['data'], 'test.csv', { type: 'text/csv' })
    await act(async () => { await result.current.importCSV(file) })

    expect(result.current.success).toBe('CSV importado: 3 registros.')
  })

  it('propagates CSV upload errors', async () => {
    getMetricas.mockResolvedValue(sampleMetricas)
    uploadCSV.mockRejectedValueOnce(new Error('Invalid CSV format'))

    const { result } = renderHook(() => useMetricas())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const file = new File(['bad'], 'bad.csv')
    await expect(
      act(async () => { await result.current.importCSV(file) })
    ).rejects.toThrow('Invalid CSV format')
  })
})

describe('useMetricas – clearMessages', () => {
  it('clears error and success state', async () => {
    getMetricas.mockResolvedValue(sampleMetricas)
    createMetrica.mockResolvedValueOnce(sampleMetricas[0])

    const { result } = renderHook(() => useMetricas())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.save(null, { nombre_metrica: 'Test' }) })
    expect(result.current.success).toBe('Métrica creada.')

    act(() => { result.current.clearMessages() })
    expect(result.current.success).toBe('')
    expect(result.current.error).toBe('')
  })
})

// ──────────────────────────────────────────────────────────────────────
// useResumen
// ──────────────────────────────────────────────────────────────────────

describe('useResumen – initial fetch', () => {
  it('fetches summary data on mount', async () => {
    const summary = [{ categoria: 'Ventas', total_metricas: 5 }]
    getResumen.mockResolvedValueOnce(summary)

    const { result } = renderHook(() => useResumen())
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.resumen).toEqual(summary)
    expect(result.current.error).toBe('')
    expect(getResumen).toHaveBeenCalledWith({})
  })

  it('passes filters to getResumen', async () => {
    getResumen.mockResolvedValueOnce([])
    renderHook(() => useResumen({ anio: 2024, trimestre: 1 }))

    await waitFor(() => expect(getResumen).toHaveBeenCalledWith({ anio: 2024, trimestre: 1 }))
  })

  it('sets error when fetch fails', async () => {
    getResumen.mockRejectedValueOnce(new Error('Resumen error'))

    const { result } = renderHook(() => useResumen())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Resumen error')
    expect(result.current.resumen).toBeNull()
  })
})

describe('useResumen – refresh', () => {
  it('calls getResumen again when refresh is invoked', async () => {
    const summary = [{ categoria: 'Ventas', total_metricas: 5 }]
    getResumen.mockResolvedValue(summary)

    const { result } = renderHook(() => useResumen())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { result.current.refresh() })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(getResumen).toHaveBeenCalledTimes(2)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

vi.mock('../../api/periodos.js', () => ({
  getPeriodos: vi.fn(),
  upsertPeriodo: vi.fn(),
  deletePeriodo: vi.fn(),
}))

import { getPeriodos, upsertPeriodo, deletePeriodo } from '../../api/periodos.js'
import { usePeriodos } from '../../hooks/usePeriodos.js'

const samplePeriodos = [
  { id: 1, anio: 2024, mes: 1, nombre_mes: 'Enero', trimestre: 1 },
  { id: 2, anio: 2024, mes: 2, nombre_mes: 'Febrero', trimestre: 1 },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('usePeriodos – initial fetch', () => {
  it('starts with loading true and fetches periodos on mount', async () => {
    getPeriodos.mockResolvedValueOnce(samplePeriodos)
    const { result } = renderHook(() => usePeriodos())

    // Initially loading
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.periodos).toEqual(samplePeriodos)
    expect(result.current.error).toBe('')
  })

  it('sets error state when fetch fails', async () => {
    getPeriodos.mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => usePeriodos())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Network error')
    expect(result.current.periodos).toEqual([])
  })
})

describe('usePeriodos – save', () => {
  it('calls upsertPeriodo, sets success, and refreshes the list', async () => {
    getPeriodos.mockResolvedValue(samplePeriodos)
    upsertPeriodo.mockResolvedValueOnce(samplePeriodos[0])

    const { result } = renderHook(() => usePeriodos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.save({ anio: 2024, mes: 1 })
    })

    expect(upsertPeriodo).toHaveBeenCalledWith({ anio: 2024, mes: 1 })
    expect(result.current.success).toBe('Período guardado correctamente.')
    // getPeriodos was called once on mount, once after save
    expect(getPeriodos).toHaveBeenCalledTimes(2)
  })

  it('propagates save errors via thrown exception', async () => {
    getPeriodos.mockResolvedValue(samplePeriodos)
    upsertPeriodo.mockRejectedValueOnce(new Error('Validation error'))

    const { result } = renderHook(() => usePeriodos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => { await result.current.save({}) })
    ).rejects.toThrow('Validation error')
  })
})

describe('usePeriodos – remove', () => {
  it('calls deletePeriodo, sets success, and refreshes the list', async () => {
    getPeriodos.mockResolvedValue(samplePeriodos)
    deletePeriodo.mockResolvedValueOnce(samplePeriodos[0])

    const { result } = renderHook(() => usePeriodos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.remove(1)
    })

    expect(deletePeriodo).toHaveBeenCalledWith(1)
    expect(result.current.success).toBe('Período eliminado.')
    expect(getPeriodos).toHaveBeenCalledTimes(2)
  })

  it('propagates delete errors via thrown exception', async () => {
    getPeriodos.mockResolvedValue(samplePeriodos)
    deletePeriodo.mockRejectedValueOnce(new Error('Cannot delete'))

    const { result } = renderHook(() => usePeriodos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => { await result.current.remove(1) })
    ).rejects.toThrow('Cannot delete')
  })
})

describe('usePeriodos – clearMessages', () => {
  it('clears error and success messages', async () => {
    getPeriodos.mockResolvedValue(samplePeriodos)
    upsertPeriodo.mockResolvedValueOnce(samplePeriodos[0])

    const { result } = renderHook(() => usePeriodos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.save({ anio: 2024, mes: 1 }) })
    expect(result.current.success).toBe('Período guardado correctamente.')

    act(() => { result.current.clearMessages() })
    expect(result.current.success).toBe('')
    expect(result.current.error).toBe('')
  })
})

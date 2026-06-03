import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

vi.mock('../../api/categorias.js', () => ({
  getCategorias: vi.fn(),
  createCategoria: vi.fn(),
  updateCategoria: vi.fn(),
  deleteCategoria: vi.fn(),
}))

import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from '../../api/categorias.js'
import { useCategorias } from '../../hooks/useCategorias.js'

const sampleCategorias = [
  { id: 1, nombre: 'Ventas', descripcion: 'Métricas de ventas', color_hex: '#FF5733' },
  { id: 2, nombre: 'Marketing', descripcion: 'Métricas de marketing', color_hex: '#3399FF' },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCategorias – initial fetch', () => {
  it('starts with loading true and fetches categorias on mount', async () => {
    getCategorias.mockResolvedValueOnce(sampleCategorias)
    const { result } = renderHook(() => useCategorias())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.categorias).toEqual(sampleCategorias)
    expect(result.current.error).toBe('')
  })

  it('sets error state when fetch fails', async () => {
    getCategorias.mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useCategorias())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Network error')
    expect(result.current.categorias).toEqual([])
  })
})

describe('useCategorias – save (create)', () => {
  it('calls createCategoria when id is null, sets success, and refreshes', async () => {
    getCategorias.mockResolvedValue(sampleCategorias)
    createCategoria.mockResolvedValueOnce(sampleCategorias[0])

    const { result } = renderHook(() => useCategorias())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.save(null, { nombre: 'Ventas', color_hex: '#FF5733' })
    })

    expect(createCategoria).toHaveBeenCalledWith({ nombre: 'Ventas', color_hex: '#FF5733' })
    expect(updateCategoria).not.toHaveBeenCalled()
    expect(result.current.success).toBe('Categoría creada.')
    expect(getCategorias).toHaveBeenCalledTimes(2)
  })

  it('propagates create errors', async () => {
    getCategorias.mockResolvedValue(sampleCategorias)
    createCategoria.mockRejectedValueOnce(new Error('Nombre duplicado'))

    const { result } = renderHook(() => useCategorias())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => { await result.current.save(null, { nombre: 'Ventas' }) })
    ).rejects.toThrow('Nombre duplicado')
  })
})

describe('useCategorias – save (update)', () => {
  it('calls updateCategoria when id is provided, sets success, and refreshes', async () => {
    getCategorias.mockResolvedValue(sampleCategorias)
    updateCategoria.mockResolvedValueOnce({ ...sampleCategorias[0], nombre: 'Ventas Updated' })

    const { result } = renderHook(() => useCategorias())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.save(1, { nombre: 'Ventas Updated' })
    })

    expect(updateCategoria).toHaveBeenCalledWith(1, { nombre: 'Ventas Updated' })
    expect(createCategoria).not.toHaveBeenCalled()
    expect(result.current.success).toBe('Categoría actualizada.')
    expect(getCategorias).toHaveBeenCalledTimes(2)
  })

  it('propagates update errors', async () => {
    getCategorias.mockResolvedValue(sampleCategorias)
    updateCategoria.mockRejectedValueOnce(new Error('Not found'))

    const { result } = renderHook(() => useCategorias())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => { await result.current.save(999, {}) })
    ).rejects.toThrow('Not found')
  })
})

describe('useCategorias – remove', () => {
  it('calls deleteCategoria, sets success, and refreshes the list', async () => {
    getCategorias.mockResolvedValue(sampleCategorias)
    deleteCategoria.mockResolvedValueOnce(sampleCategorias[0])

    const { result } = renderHook(() => useCategorias())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.remove(1)
    })

    expect(deleteCategoria).toHaveBeenCalledWith(1)
    expect(result.current.success).toBe('Categoría eliminada.')
    expect(getCategorias).toHaveBeenCalledTimes(2)
  })

  it('propagates delete errors', async () => {
    getCategorias.mockResolvedValue(sampleCategorias)
    deleteCategoria.mockRejectedValueOnce(new Error('Foreign key constraint'))

    const { result } = renderHook(() => useCategorias())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => { await result.current.remove(1) })
    ).rejects.toThrow('Foreign key constraint')
  })
})

describe('useCategorias – clearMessages', () => {
  it('clears error and success messages', async () => {
    getCategorias.mockResolvedValue(sampleCategorias)
    createCategoria.mockResolvedValueOnce(sampleCategorias[0])

    const { result } = renderHook(() => useCategorias())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.save(null, { nombre: 'Test' }) })
    expect(result.current.success).toBe('Categoría creada.')

    act(() => { result.current.clearMessages() })
    expect(result.current.success).toBe('')
    expect(result.current.error).toBe('')
  })
})

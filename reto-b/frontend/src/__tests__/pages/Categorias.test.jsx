import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock the hook before importing the page
vi.mock('../../hooks/useCategorias.js', () => ({
  useCategorias: vi.fn(),
}))

import { useCategorias } from '../../hooks/useCategorias.js'
import Categorias from '../../pages/Categorias.jsx'

const sampleCategorias = [
  { id: 1, nombre: 'Ventas', descripcion: 'Métricas de ventas', color_hex: '#FF5733' },
  { id: 2, nombre: 'Marketing', descripcion: null, color_hex: '#3399FF' },
]

const defaultHook = {
  categorias: sampleCategorias,
  loading: false,
  error: '',
  success: '',
  setError: vi.fn(),
  setSuccess: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  useCategorias.mockReturnValue({ ...defaultHook })
})

describe('Categorias page – rendering', () => {
  it('renders the page title', () => {
    render(<Categorias />)
    expect(screen.getByText('Categorías')).toBeInTheDocument()
  })

  it('renders a card for each category', () => {
    render(<Categorias />)
    expect(screen.getByText('Ventas')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
  })

  it('shows the spinner when loading is true', () => {
    useCategorias.mockReturnValue({ ...defaultHook, loading: true, categorias: [] })
    render(<Categorias />)
    expect(screen.getByText(/Cargando/)).toBeInTheDocument()
  })

  it('shows empty state message when no categories', () => {
    useCategorias.mockReturnValue({ ...defaultHook, categorias: [] })
    render(<Categorias />)
    expect(screen.getByText(/No hay categorías registradas/)).toBeInTheDocument()
  })

  it('displays the error alert when error is set', () => {
    useCategorias.mockReturnValue({ ...defaultHook, error: 'Something failed' })
    render(<Categorias />)
    expect(screen.getByText('Something failed')).toBeInTheDocument()
  })

  it('displays the success alert when success is set', () => {
    useCategorias.mockReturnValue({ ...defaultHook, success: 'Categoría creada.' })
    render(<Categorias />)
    expect(screen.getByText('Categoría creada.')).toBeInTheDocument()
  })

  it('renders category descriptions when present', () => {
    render(<Categorias />)
    expect(screen.getByText('Métricas de ventas')).toBeInTheDocument()
  })

  it('renders color hex value in each card', () => {
    render(<Categorias />)
    expect(screen.getByText('#FF5733')).toBeInTheDocument()
    expect(screen.getByText('#3399FF')).toBeInTheDocument()
  })
})

describe('Categorias page – create', () => {
  it('opens the create modal when + Nueva categoría is clicked', () => {
    render(<Categorias />)
    fireEvent.click(screen.getByText('+ Nueva categoría'))
    expect(screen.getByText('Nueva categoría')).toBeInTheDocument()
  })

  it('closes the modal when Cancelar is clicked', () => {
    render(<Categorias />)
    fireEvent.click(screen.getByText('+ Nueva categoría'))
    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Nueva categoría')).toBeNull()
  })

  it('calls save with null id and form data on submit', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    useCategorias.mockReturnValue({ ...defaultHook, save })

    render(<Categorias />)
    fireEvent.click(screen.getByText('+ Nueva categoría'))

    // First textbox is the nombre input; second is the descripcion textarea
    const nameInput = screen.getAllByRole('textbox')[0]
    fireEvent.change(nameInput, { target: { value: 'Nueva Cat' } })
    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith(null, expect.objectContaining({ nombre: 'Nueva Cat' }))
    })
  })
})

describe('Categorias page – edit', () => {
  it('opens edit modal with pre-populated fields when Editar is clicked', () => {
    render(<Categorias />)
    const editButtons = screen.getAllByText('Editar')
    fireEvent.click(editButtons[0])

    expect(screen.getByText('Editar categoría')).toBeInTheDocument()
    // First textbox is the nombre input
    const input = screen.getAllByRole('textbox')[0]
    expect(input.value).toBe('Ventas')
  })

  it('calls save with existing id when editing', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    useCategorias.mockReturnValue({ ...defaultHook, save })

    render(<Categorias />)
    const editButtons = screen.getAllByText('Editar')
    fireEvent.click(editButtons[0])

    // Submit the form with prefilled values
    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith(1, expect.objectContaining({ nombre: 'Ventas' }))
    })
  })
})

describe('Categorias page – delete', () => {
  it('calls remove after window.confirm returns true', async () => {
    const remove = vi.fn().mockResolvedValue(undefined)
    useCategorias.mockReturnValue({ ...defaultHook, remove })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<Categorias />)
    const deleteButtons = screen.getAllByText('Eliminar')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith(1)
    })
    vi.restoreAllMocks()
  })

  it('does not call remove when window.confirm returns false', () => {
    const remove = vi.fn()
    useCategorias.mockReturnValue({ ...defaultHook, remove })
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<Categorias />)
    const deleteButtons = screen.getAllByText('Eliminar')
    fireEvent.click(deleteButtons[0])

    expect(remove).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})

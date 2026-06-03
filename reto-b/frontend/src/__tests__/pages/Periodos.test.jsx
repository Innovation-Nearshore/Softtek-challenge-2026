import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('../../hooks/usePeriodos.js', () => ({
  usePeriodos: vi.fn(),
}))

import { usePeriodos } from '../../hooks/usePeriodos.js'
import Periodos from '../../pages/Periodos.jsx'

const samplePeriodos = [
  { id: 1, anio: 2024, mes: 1, nombre_mes: 'Enero', trimestre: 1, fecha_inicio: '2024-01-01', fecha_fin: '2024-01-31' },
  { id: 2, anio: 2024, mes: 2, nombre_mes: 'Febrero', trimestre: 1, fecha_inicio: null, fecha_fin: null },
]

const defaultHook = {
  periodos: samplePeriodos,
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
  usePeriodos.mockReturnValue({ ...defaultHook })
})

describe('Periodos page – rendering', () => {
  it('renders the page title', () => {
    render(<Periodos />)
    expect(screen.getByText('Períodos')).toBeInTheDocument()
  })

  it('renders a row for each period', () => {
    render(<Periodos />)
    expect(screen.getByText(/Enero 2024/)).toBeInTheDocument()
    expect(screen.getByText(/Febrero 2024/)).toBeInTheDocument()
  })

  it('renders trimestre labels correctly', () => {
    render(<Periodos />)
    const q1cells = screen.getAllByText('Q1')
    expect(q1cells.length).toBeGreaterThanOrEqual(2)
  })

  it('shows spinner when loading', () => {
    usePeriodos.mockReturnValue({ ...defaultHook, loading: true, periodos: [] })
    render(<Periodos />)
    expect(screen.getByText(/Cargando/)).toBeInTheDocument()
  })

  it('shows empty state message when no periods', () => {
    usePeriodos.mockReturnValue({ ...defaultHook, periodos: [] })
    render(<Periodos />)
    expect(screen.getByText(/No hay períodos registrados/)).toBeInTheDocument()
  })

  it('displays error alert when error is set', () => {
    usePeriodos.mockReturnValue({ ...defaultHook, error: 'Error loading' })
    render(<Periodos />)
    expect(screen.getByText('Error loading')).toBeInTheDocument()
  })

  it('displays success alert when success is set', () => {
    usePeriodos.mockReturnValue({ ...defaultHook, success: 'Período guardado correctamente.' })
    render(<Periodos />)
    expect(screen.getByText('Período guardado correctamente.')).toBeInTheDocument()
  })

  it('renders dash (—) for null fecha_inicio and fecha_fin', () => {
    render(<Periodos />)
    const dashes = screen.getAllByText('—')
    // Febrero has both null dates → 2 dashes
    expect(dashes.length).toBeGreaterThanOrEqual(2)
  })
})

describe('Periodos page – create', () => {
  it('opens the create modal when + Nuevo período is clicked', () => {
    render(<Periodos />)
    fireEvent.click(screen.getByText('+ Nuevo período'))
    expect(screen.getByText('Nuevo período')).toBeInTheDocument()
  })

  it('closes the modal when Cancelar is clicked', () => {
    render(<Periodos />)
    fireEvent.click(screen.getByText('+ Nuevo período'))
    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Nuevo período')).toBeNull()
  })

  it('calls save with form data when form is submitted', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    usePeriodos.mockReturnValue({ ...defaultHook, save })

    render(<Periodos />)
    fireEvent.click(screen.getByText('+ Nuevo período'))
    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith(
        expect.objectContaining({ anio: expect.any(Number), mes: expect.any(Number) })
      )
    })
  })

  it('closes modal after successful save', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    usePeriodos.mockReturnValue({ ...defaultHook, save })

    render(<Periodos />)
    fireEvent.click(screen.getByText('+ Nuevo período'))
    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(screen.queryByText('Nuevo período')).toBeNull()
    })
  })
})

describe('Periodos page – delete', () => {
  it('calls remove when confirm returns true', async () => {
    const remove = vi.fn().mockResolvedValue(undefined)
    usePeriodos.mockReturnValue({ ...defaultHook, remove })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<Periodos />)
    const deleteButtons = screen.getAllByText('Eliminar')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith(1)
    })
    vi.restoreAllMocks()
  })

  it('does not call remove when confirm returns false', () => {
    const remove = vi.fn()
    usePeriodos.mockReturnValue({ ...defaultHook, remove })
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<Periodos />)
    const deleteButtons = screen.getAllByText('Eliminar')
    fireEvent.click(deleteButtons[0])

    expect(remove).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})

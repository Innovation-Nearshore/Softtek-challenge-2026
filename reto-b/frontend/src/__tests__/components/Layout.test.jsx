import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'

// Provide a MemoryRouter so NavLink and Outlet can render
function renderLayout(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Layout />
    </MemoryRouter>
  )
}

describe('Layout component', () => {
  it('renders the application title', () => {
    renderLayout()
    expect(screen.getByText(/Métricas Mensuales/)).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Métricas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Períodos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Categorías' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reporte PDF' })).toBeInTheDocument()
  })

  it('navigation links point to correct hrefs', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Métricas' })).toHaveAttribute('href', '/metricas')
    expect(screen.getByRole('link', { name: 'Períodos' })).toHaveAttribute('href', '/periodos')
    expect(screen.getByRole('link', { name: 'Categorías' })).toHaveAttribute('href', '/categorias')
    expect(screen.getByRole('link', { name: 'Reporte PDF' })).toHaveAttribute('href', '/reporte')
  })

  it('renders the footer text', () => {
    renderLayout()
    expect(screen.getByText(/Reto B/)).toBeInTheDocument()
    expect(screen.getByText(/Softtek 2026/)).toBeInTheDocument()
  })

  it('renders a header and main element', () => {
    const { container } = renderLayout()
    expect(container.querySelector('header')).not.toBeNull()
    expect(container.querySelector('main')).not.toBeNull()
    expect(container.querySelector('footer')).not.toBeNull()
  })

  it('applies active styles to the Dashboard link when on /', () => {
    renderLayout('/')
    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' })
    expect(dashboardLink.className).toMatch(/underline/)
  })

  it('applies active styles to Métricas link when on /metricas', () => {
    renderLayout('/metricas')
    const metricasLink = screen.getByRole('link', { name: 'Métricas' })
    expect(metricasLink.className).toMatch(/underline/)
  })
})

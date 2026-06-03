import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Spinner from '../../components/Spinner.jsx'

describe('Spinner component', () => {
  it('renders the default loading text', () => {
    render(<Spinner />)
    expect(screen.getByText('Cargando…')).toBeInTheDocument()
  })

  it('renders custom text when text prop is provided', () => {
    render(<Spinner text="Por favor espere..." />)
    expect(screen.getByText('Por favor espere...')).toBeInTheDocument()
  })

  it('renders the spinning animation element', () => {
    const { container } = render(<Spinner />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).not.toBeNull()
  })

  it('renders within a flex column container', () => {
    const { container } = render(<Spinner />)
    const wrapper = container.firstChild
    expect(wrapper.className).toMatch(/flex/)
    expect(wrapper.className).toMatch(/flex-col/)
  })
})

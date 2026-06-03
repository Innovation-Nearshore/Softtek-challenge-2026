import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Alert from '../../components/Alert.jsx'

describe('Alert component', () => {
  it('renders nothing when message is empty/falsy', () => {
    const { container } = render(<Alert message="" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when message is null', () => {
    const { container } = render(<Alert message={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the message text', () => {
    render(<Alert message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('applies error styles by default', () => {
    const { container } = render(<Alert message="Error occurred" />)
    const div = container.firstChild
    expect(div.className).toMatch(/text-red-700/)
    expect(div.className).toMatch(/bg-red-50/)
  })

  it('applies success styles when type="success"', () => {
    const { container } = render(<Alert type="success" message="Saved!" />)
    const div = container.firstChild
    expect(div.className).toMatch(/text-green-700/)
    expect(div.className).toMatch(/bg-green-50/)
  })

  it('applies info styles when type="info"', () => {
    const { container } = render(<Alert type="info" message="Note" />)
    const div = container.firstChild
    expect(div.className).toMatch(/text-blue-700/)
    expect(div.className).toMatch(/bg-blue-50/)
  })

  it('renders close button when onClose is provided', () => {
    const onClose = vi.fn()
    render(<Alert message="Error" onClose={onClose} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('does not render close button when onClose is not provided', () => {
    render(<Alert message="Error" />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<Alert message="Error" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

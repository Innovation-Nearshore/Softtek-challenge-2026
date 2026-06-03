import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../../components/Modal.jsx'

describe('Modal component', () => {
  it('renders the title', () => {
    render(<Modal title="Test Modal" onClose={vi.fn()}><p>Content</p></Modal>)
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(<Modal title="Title" onClose={vi.fn()}><p>Modal body text</p></Modal>)
    expect(screen.getByText('Modal body text')).toBeInTheDocument()
  })

  it('renders the close button', () => {
    render(<Modal title="Title" onClose={vi.fn()}><span /></Modal>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<Modal title="Title" onClose={onClose}><span /></Modal>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(<Modal title="Title" onClose={onClose}><span /></Modal>)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when a non-Escape key is pressed', () => {
    const onClose = vi.fn()
    render(<Modal title="Title" onClose={onClose}><span /></Modal>)
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('cleans up the Escape key listener on unmount', () => {
    const onClose = vi.fn()
    const { unmount } = render(<Modal title="Title" onClose={onClose}><span /></Modal>)
    unmount()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders with an overlay background', () => {
    const { container } = render(<Modal title="Title" onClose={vi.fn()}><span /></Modal>)
    const overlay = container.firstChild
    expect(overlay.className).toMatch(/fixed/)
    expect(overlay.className).toMatch(/inset-0/)
  })
})

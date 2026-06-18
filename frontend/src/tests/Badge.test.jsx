import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge, UrgencyBadge } from '../components/Badge';

// ── StatusBadge ───────────────────────────────────────────────────────────────

describe('StatusBadge – happy path', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="Recibida" />);
    expect(screen.getByText('Recibida')).toBeInTheDocument();
  });

  it('applies status-recibida class for Recibida', () => {
    render(<StatusBadge status="Recibida" />);
    const badge = screen.getByText('Recibida');
    expect(badge).toHaveClass('status-recibida');
    expect(badge).toHaveClass('badge');
    expect(badge).toHaveClass('status-badge');
  });

  it('applies status-en-revision class for En revisión', () => {
    render(<StatusBadge status="En revisión" />);
    const badge = screen.getByText('En revisión');
    expect(badge).toHaveClass('status-en-revision');
  });

  it('applies status-resuelta class for Resuelta', () => {
    render(<StatusBadge status="Resuelta" />);
    expect(screen.getByText('Resuelta')).toHaveClass('status-resuelta');
  });

  it('applies status-rechazada class for Rechazada', () => {
    render(<StatusBadge status="Rechazada" />);
    expect(screen.getByText('Rechazada')).toHaveClass('status-rechazada');
  });

  it('applies status-cancelada class for Cancelada', () => {
    render(<StatusBadge status="Cancelada" />);
    expect(screen.getByText('Cancelada')).toHaveClass('status-cancelada');
  });

  it('falls back to status-default for an unknown status', () => {
    render(<StatusBadge status="Desconocido" />);
    expect(screen.getByText('Desconocido')).toHaveClass('status-default');
  });
});

// ── UrgencyBadge ──────────────────────────────────────────────────────────────

describe('UrgencyBadge – happy path', () => {
  it('renders the urgency text', () => {
    render(<UrgencyBadge urgencia="Alta" />);
    expect(screen.getByText('Alta')).toBeInTheDocument();
  });

  it('applies urgency-alta class for Alta', () => {
    render(<UrgencyBadge urgencia="Alta" />);
    const badge = screen.getByText('Alta');
    expect(badge).toHaveClass('urgency-alta');
    expect(badge).toHaveClass('badge');
    expect(badge).toHaveClass('urgency-badge');
  });

  it('applies urgency-media class for Media', () => {
    render(<UrgencyBadge urgencia="Media" />);
    expect(screen.getByText('Media')).toHaveClass('urgency-media');
  });

  it('applies urgency-baja class for Baja', () => {
    render(<UrgencyBadge urgencia="Baja" />);
    expect(screen.getByText('Baja')).toHaveClass('urgency-baja');
  });

  it('falls back to urgency-default for unknown urgency', () => {
    render(<UrgencyBadge urgencia="Crítica" />);
    expect(screen.getByText('Crítica')).toHaveClass('urgency-default');
  });
});

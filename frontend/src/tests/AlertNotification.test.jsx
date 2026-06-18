import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertNotification } from '../components/AlertNotification';

describe('AlertNotification – happy path', () => {
  it('renders a single message string correctly', () => {
    render(<AlertNotification messages="Algo salió mal" />);
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<AlertNotification title="Error crítico" messages="Detalle del error" />);
    expect(screen.getByText('Error crítico')).toBeInTheDocument();
    expect(screen.getByText('Detalle del error')).toBeInTheDocument();
  });

  it('renders multiple messages as a list', () => {
    render(<AlertNotification messages={['Error 1', 'Error 2', 'Error 3']} />);
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
    expect(screen.getByText('Error 3')).toBeInTheDocument();
  });

  it('applies the correct CSS class for "error" type', () => {
    render(<AlertNotification type="error" messages="Test error" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-notification--error');
  });

  it('applies the correct CSS class for "warning" type', () => {
    render(<AlertNotification type="warning" messages="Test warning" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-notification--warning');
  });

  it('applies the correct CSS class for "success" type', () => {
    render(<AlertNotification type="success" messages="Operación exitosa" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-notification--success');
  });

  it('renders the close button when onClose prop is provided', () => {
    const onClose = vi.fn();
    render(<AlertNotification messages="Test" onClose={onClose} />);
    expect(screen.getByLabelText('Cerrar notificación')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<AlertNotification messages="Test" onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Cerrar notificación'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides the component after clicking the close button', () => {
    render(<AlertNotification messages="Test cerramiento" onClose={() => {}} />);
    const closeBtn = screen.getByLabelText('Cerrar notificación');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('Test cerramiento')).not.toBeInTheDocument();
  });

  it('does not render close button when onClose prop is absent', () => {
    render(<AlertNotification messages="Sin cierre" />);
    expect(screen.queryByLabelText('Cerrar notificación')).not.toBeInTheDocument();
  });
});

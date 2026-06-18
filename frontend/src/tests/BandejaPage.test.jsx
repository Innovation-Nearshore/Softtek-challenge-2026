import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mock the API module ───────────────────────────────────────────────────────
vi.mock('../api/solicitudesApi', () => ({
  default: {
    getSolicitudes: vi.fn(),
    getTiposSolicitud: vi.fn(),
    getMetricas: vi.fn(),
    changeStatus: vi.fn(),
  },
}));

import solicitudesApi from '../api/solicitudesApi';
import { BandejaPage } from '../pages/BandejaPage';

// ── Fixtures ──────────────────────────────────────────────────────────────────
const mockMetricas = {
  porEstado: [
    { estado: 'Recibida', total: 5 },
    { estado: 'En revisión', total: 2 },
    { estado: 'Resuelta', total: 8 },
  ],
  porUrgencia: [
    { urgencia: 'Alta', total: 3 },
    { urgencia: 'Media', total: 6 },
    { urgencia: 'Baja', total: 6 },
  ],
  alertasAltaSinMover: 2,
};

const mockSolicitudNormal = {
  id: 1,
  numeroTicket: 'TKT-20260618-0001',
  tipoSolicitudId: 1,
  tipoSolicitudNombre: 'Soporte Técnico',
  titulo: 'Impresora no funciona',
  descripcion: 'La impresora no responde al enviar trabajos de impresión.',
  urgencia: 'Media',
  estado: 'Recibida',
  solicitante: 'Ana López',
  emailSolicitante: 'ana@empresa.com',
  areaSolicitanteId: 1,
  areaSolicitanteNombre: 'RRHH',
  areaAsignadaId: null,
  areaAsignadaNombre: null,
  asignadoA: null,
  fechaCreacion: new Date().toISOString(),
  fechaVencimiento: null,
  fechaResolucion: null,
  solucion: null,
  calificacion: null,
  comentarioCalificacion: null,
  alertaRiesgo: false,
};

const mockSolicitudRiesgo = {
  ...mockSolicitudNormal,
  id: 2,
  urgencia: 'Alta',
  alertaRiesgo: true,
  descripcion: 'Sistema crítico caído más de 24h.',
  solicitante: 'Carlos Ruiz',
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <BandejaPage />
    </MemoryRouter>
  );

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BandejaPage – metrics dashboard (happy path)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    solicitudesApi.getTiposSolicitud.mockResolvedValue({ data: [] });
  });

  it('renders the "Por Estado" section heading', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({ data: [] });
    solicitudesApi.getMetricas.mockResolvedValue({ data: mockMetricas });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Por Estado/i)).toBeInTheDocument();
    });
  });

  it('renders the "Por Urgencia" section heading', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({ data: [] });
    solicitudesApi.getMetricas.mockResolvedValue({ data: mockMetricas });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Por Urgencia/i)).toBeInTheDocument();
    });
  });

  it('displays the correct total for Recibidas', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({ data: [] });
    solicitudesApi.getMetricas.mockResolvedValue({ data: mockMetricas });

    renderPage();

    await waitFor(() => {
      // The MetricCard renders the numeric value; 5 is the total for Recibida
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('shows the alert banner when alertasAltaSinMover > 0', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({ data: [] });
    solicitudesApi.getMetricas.mockResolvedValue({ data: mockMetricas }); // alertasAltaSinMover: 2

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText(/solicitudes de urgencia/i)
      ).toBeInTheDocument();
    });
  });

  it('does NOT show the alert banner when alertasAltaSinMover = 0', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({ data: [] });
    solicitudesApi.getMetricas.mockResolvedValue({
      data: { ...mockMetricas, alertasAltaSinMover: 0 },
    });

    renderPage();

    await waitFor(() => {
      // Ensure metrics loaded (Por Estado heading present)
      expect(screen.getByText(/Por Estado/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/solicitudes de urgencia/i)).not.toBeInTheDocument();
  });

  it('displays count card labels for every urgencia level', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({ data: [] });
    solicitudesApi.getMetricas.mockResolvedValue({ data: mockMetricas });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Recibidas')).toBeInTheDocument();
      expect(screen.getByText('En Revisión')).toBeInTheDocument();
      expect(screen.getByText('Resueltas')).toBeInTheDocument();
    });
  });
});

describe('BandejaPage – risk indicator in table (happy path)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    solicitudesApi.getTiposSolicitud.mockResolvedValue({ data: [] });
    solicitudesApi.getMetricas.mockResolvedValue({ data: mockMetricas });
  });

  it('renders the 🚨 risk indicator for solicitudes with alertaRiesgo = true', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({
      data: [mockSolicitudRiesgo],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTitle('Alta urgencia sin mover hace más de 24h')).toBeInTheDocument();
    });
  });

  it('does NOT render the 🚨 indicator for solicitudes with alertaRiesgo = false', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({
      data: [mockSolicitudNormal],
    });

    renderPage();

    await waitFor(() => {
      // Table row is visible
      expect(screen.getByText('Ana López')).toBeInTheDocument();
    });

    expect(
      screen.queryByTitle('Alta urgencia sin mover hace más de 24h')
    ).not.toBeInTheDocument();
  });

  it('applies row-risk-alert CSS class to high-risk rows', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({
      data: [mockSolicitudRiesgo],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument();
    });

    // Find the row that contains the risk indicator
    const riskSpan = screen.getByTitle('Alta urgencia sin mover hace más de 24h');
    const row = riskSpan.closest('tr');
    expect(row).toHaveClass('row-risk-alert');
  });

  it('renders normal rows without row-risk-alert class', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({
      data: [mockSolicitudNormal],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Ana López')).toBeInTheDocument();
    });

    // Find the table row for the normal solicitud
    const cell = screen.getByText('Ana López');
    const row = cell.closest('tr');
    expect(row).not.toHaveClass('row-risk-alert');
  });

  it('renders the solicitudes table with correct columns', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({
      data: [mockSolicitudNormal],
    });

    renderPage();

    // Wait for the data row to appear first, then verify column headers
    await waitFor(() => {
      expect(screen.getByText('Ana López')).toBeInTheDocument();
    });

    // Column headers are always present once the table is rendered
    const ths = document.querySelectorAll('th');
    const headerTexts = Array.from(ths).map((th) => th.textContent.trim());
    expect(headerTexts).toContain('Ticket');
    expect(headerTexts).toContain('Urgencia');
    expect(headerTexts).toContain('Estado');
  });

  it('renders both risk and normal rows when both kinds are present', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({
      data: [mockSolicitudNormal, mockSolicitudRiesgo],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Ana López')).toBeInTheDocument();
      expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument();
      expect(screen.getByTitle('Alta urgencia sin mover hace más de 24h')).toBeInTheDocument();
    });
  });
});

describe('BandejaPage – solicitudesApi integration (happy path)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    solicitudesApi.getTiposSolicitud.mockResolvedValue({ data: [] });
    solicitudesApi.getMetricas.mockResolvedValue({ data: mockMetricas });
  });

  it('calls getSolicitudes on mount', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({ data: [] });

    renderPage();

    await waitFor(() => {
      expect(solicitudesApi.getSolicitudes).toHaveBeenCalled();
    });
  });

  it('calls getMetricas on mount', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({ data: [] });

    renderPage();

    await waitFor(() => {
      expect(solicitudesApi.getMetricas).toHaveBeenCalled();
    });
  });

  it('shows the "Bandeja de Solicitudes" heading', async () => {
    solicitudesApi.getSolicitudes.mockResolvedValue({ data: [] });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Bandeja de Solicitudes/i })
      ).toBeInTheDocument();
    });
  });
});

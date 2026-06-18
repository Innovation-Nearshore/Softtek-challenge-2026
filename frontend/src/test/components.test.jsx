import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Mock the API module ──────────────────────────────────────────────────────
vi.mock('../api', () => ({
  getTipos:         vi.fn(),
  getAreas:         vi.fn(),
  createSolicitud:  vi.fn(),
  getSolicitudes:   vi.fn(),
  updateEstado:     vi.fn(),
  getHistorialById: vi.fn(),
  getMetrics:       vi.fn(),
}));

import * as api from '../api';
import RequestForm      from '../components/RequestForm';
import Inbox            from '../components/Inbox';
import MetricsDashboard from '../components/MetricsDashboard';

// ─── Shared fixtures ──────────────────────────────────────────────────────────
const fakeTipos = [
  { id: 1, nombre: 'Soporte TI' },
  { id: 2, nombre: 'Compras' },
];
const fakeAreas = [
  { id: 1, nombre: 'IT' },
  { id: 2, nombre: 'RRHH' },
];
const fakeSolicitudes = [
  {
    id: 1,
    numero_ticket: 'TK2606-001',
    titulo: 'Problema con laptop',
    tipo_solicitud_nombre: 'Soporte TI',
    urgencia: 'Alta',
    estado: 'Recibida',
    solicitante: 'Ana Garcia',
    area_solicitante_nombre: 'IT',
    responsable: null,
    stale_high: false,
  },
  {
    id: 2,
    numero_ticket: 'TK2606-002',
    titulo: 'Compra de monitor',
    tipo_solicitud_nombre: 'Compras',
    urgencia: 'Baja',
    estado: 'En revisión',
    solicitante: 'Carlos Perez',
    area_solicitante_nombre: 'RRHH',
    responsable: 'Luis',
    stale_high: false,
  },
  {
    id: 3,
    numero_ticket: 'TK2606-003',
    titulo: 'Ticket resuelta',
    tipo_solicitud_nombre: 'Soporte TI',
    urgencia: 'Media',
    estado: 'Resuelta',
    solicitante: 'Maria',
    area_solicitante_nombre: 'IT',
    responsable: 'Luis',
    stale_high: false,
  },
];

const fakeMetrics = {
  by_estado: [
    { estado: 'Recibida',    count: 5 },
    { estado: 'En revisión', count: 3 },
    { estado: 'Resuelta',    count: 2 },
  ],
  by_urgencia: [
    { urgencia: 'Alta',  count: 4 },
    { urgencia: 'Media', count: 4 },
    { urgencia: 'Baja',  count: 2 },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  api.getTipos.mockResolvedValue({ data: fakeTipos });
  api.getAreas.mockResolvedValue({ data: fakeAreas });
  api.getSolicitudes.mockResolvedValue({ data: fakeSolicitudes });
  api.getMetrics.mockResolvedValue({ data: fakeMetrics });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Helper: fill all required RequestForm fields ─────────────────────────────
async function fillValidForm(overrides = {}) {
  const fields = {
    tipo:        '1',
    titulo:      'Solicitud test',
    descripcion: 'Descripcion test',
    solicitante: 'Ana Lopez',
    email:       'ana@empresa.com',
    area:        '1',
    ...overrides,
  };
  fireEvent.change(screen.getByLabelText(/tipo de solicitud/i),        { target: { value: fields.tipo } });
  fireEvent.change(screen.getByLabelText(/título/i),                   { target: { value: fields.titulo } });
  fireEvent.change(screen.getByLabelText(/descripción/i),              { target: { value: fields.descripcion } });
  fireEvent.change(screen.getByPlaceholderText(/nombre completo/i),    { target: { value: fields.solicitante } });
  fireEvent.change(screen.getByPlaceholderText(/correo@ejemplo\.com/i),{ target: { value: fields.email } });
  fireEvent.change(screen.getByLabelText(/área solicitante/i),         { target: { value: fields.area } });
}

// ══════════════════════════════════════════════════════════════════════════════
// RequestForm
// ══════════════════════════════════════════════════════════════════════════════

describe('RequestForm', () => {
  function renderForm() {
    return render(
      <MemoryRouter>
        <RequestForm />
      </MemoryRouter>
    );
  }

  it('renders the form title', () => {
    renderForm();
    expect(screen.getByText('Nueva Solicitud')).toBeInTheDocument();
  });

  it('loads tipos and areas dropdowns on mount', async () => {
    renderForm();
    expect(await screen.findByText('Soporte TI')).toBeInTheDocument();
    expect(await screen.findByText('IT')).toBeInTheDocument();
    expect(api.getTipos).toHaveBeenCalledTimes(1);
    expect(api.getAreas).toHaveBeenCalledTimes(1);
  });

  it('shows required field errors when submitting empty form', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }));
    await waitFor(() => {
      const errors = screen.getAllByText('Requerido');
      expect(errors.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('shows email format error for invalid email', async () => {
    renderForm();
    await screen.findByText('Soporte TI');
    await fillValidForm({ email: 'not-valid' });
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }));
    await waitFor(() => {
      expect(screen.getByText(/formato de email/i)).toBeInTheDocument();
    });
  });

  it('does not call createSolicitud when form has validation errors', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }));
    await waitFor(() => {
      expect(api.createSolicitud).not.toHaveBeenCalled();
    });
  });

  it('calls createSolicitud with correct payload on valid submit', async () => {
    api.createSolicitud.mockResolvedValue({ data: { numero_ticket: 'TK2606-001', id: 1 } });
    renderForm();
    await screen.findByText('Soporte TI');
    await fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }));
    await waitFor(() => {
      expect(api.createSolicitud).toHaveBeenCalledTimes(1);
      const payload = api.createSolicitud.mock.calls[0][0];
      expect(payload.tipo_solicitud_id).toBe(1);
      expect(payload.titulo).toBe('Solicitud test');
      expect(payload.email_solicitante).toBe('ana@empresa.com');
    });
  });

  it('displays ticket number after successful submission', async () => {
    api.createSolicitud.mockResolvedValue({ data: { numero_ticket: 'TK2606-042', id: 42 } });
    renderForm();
    await screen.findByText('Soporte TI');
    await fillValidForm({ titulo: 'Solicitud exitosa', email: 'bob@test.com', area: '2' });
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }));
    await waitFor(() => {
      expect(screen.getByText('TK2606-042')).toBeInTheDocument();
      expect(screen.getByText(/enviada exitosamente/i)).toBeInTheDocument();
    });
  });

  it('shows reset button on success view and resets form when clicked', async () => {
    api.createSolicitud.mockResolvedValue({ data: { numero_ticket: 'TK2606-005', id: 5 } });
    renderForm();
    await screen.findByText('Soporte TI');
    await fillValidForm({ titulo: 'Test reset', email: 'eve@test.com' });
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }));

    await waitFor(() => screen.getByText(/enviada exitosamente/i));
    fireEvent.click(screen.getByRole('button', { name: /nueva solicitud/i }));

    await waitFor(() => {
      expect(screen.getByText('Nueva Solicitud')).toBeInTheDocument();
    });
  });

  it('shows API error message on failed submission', async () => {
    api.createSolicitud.mockRejectedValue({
      response: { data: { error: 'Error del servidor' } },
    });
    renderForm();
    await screen.findByText('Soporte TI');
    await fillValidForm({ titulo: 'Test error', email: 'luis@test.com' });
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }));
    await waitFor(() => {
      expect(screen.getByText('Error del servidor')).toBeInTheDocument();
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Inbox
// ══════════════════════════════════════════════════════════════════════════════

describe('Inbox', () => {
  function renderInbox() {
    return render(
      <MemoryRouter>
        <Inbox />
      </MemoryRouter>
    );
  }

  it('renders the inbox title', () => {
    renderInbox();
    expect(screen.getByText(/bandeja de solicitudes/i)).toBeInTheDocument();
  });

  it('renders solicitudes rows', async () => {
    renderInbox();
    expect(await screen.findByText('TK2606-001')).toBeInTheDocument();
    expect(screen.getByText('TK2606-002')).toBeInTheDocument();
  });

  it('shows FSM transition button "En revision" for Recibida row', async () => {
    renderInbox();
    await screen.findByText('TK2606-001');
    expect(screen.getByRole('button', { name: /en revision/i })).toBeInTheDocument();
  });

  it('shows FSM transition button "Resuelta" for En revisión row', async () => {
    renderInbox();
    await screen.findByText('TK2606-002');
    expect(screen.getByRole('button', { name: /resuelta/i })).toBeInTheDocument();
  });

  it('does NOT show a transition button for Resuelta (final state) row', async () => {
    renderInbox();
    await screen.findByText('TK2606-003');
    const transButtons = screen.queryAllByTitle(/avanzar a/i);
    expect(transButtons).toHaveLength(2);
  });

  it('does NOT show stale risk badge when stale_high is false', async () => {
    renderInbox();
    await screen.findByText('TK2606-001');
    expect(screen.queryByText(/riesgo/i)).not.toBeInTheDocument();
  });

  it('shows stale risk badge when stale_high is true', async () => {
    api.getSolicitudes.mockResolvedValue({
      data: [{ ...fakeSolicitudes[0], stale_high: true }],
    });
    renderInbox();
    expect(await screen.findByText(/riesgo/i)).toBeInTheDocument();
  });

  it('shows stale risk badge when stale_high is "t" (pg text format)', async () => {
    api.getSolicitudes.mockResolvedValue({
      data: [{ ...fakeSolicitudes[0], stale_high: 't' }],
    });
    renderInbox();
    expect(await screen.findByText(/riesgo/i)).toBeInTheDocument();
  });

  it('opens FSM transition modal when transition button is clicked', async () => {
    renderInbox();
    await screen.findByText('TK2606-001');
    fireEvent.click(screen.getByRole('button', { name: /en revision/i }));
    expect(await screen.findByText(/cambiar estado/i)).toBeInTheDocument();
  });

  it('requires responsable when transitioning to En revisión', async () => {
    renderInbox();
    await screen.findByText('TK2606-001');
    fireEvent.click(screen.getByRole('button', { name: /en revision/i }));
    await screen.findByText(/confirmar/i);
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    await waitFor(() => {
      expect(screen.getByText(/responsable es requerido/i)).toBeInTheDocument();
    });
  });

  it('calls updateEstado with correct id when confirming transition', async () => {
    api.updateEstado.mockResolvedValue({ data: { id: 1, estado: 'En revisión' } });
    renderInbox();
    await screen.findByText('TK2606-001');
    fireEvent.click(screen.getByRole('button', { name: /en revision/i }));
    const responsableInput = await screen.findByPlaceholderText(/nombre del responsable/i);
    fireEvent.change(responsableInput, { target: { value: 'Luis Lopez' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    await waitFor(() => {
      expect(api.updateEstado).toHaveBeenCalledWith(1, expect.objectContaining({
        responsable: 'Luis Lopez',
      }));
    });
  });

  it('shows empty state when no solicitudes match filters', async () => {
    api.getSolicitudes.mockResolvedValue({ data: [] });
    renderInbox();
    expect(await screen.findByText(/no hay solicitudes/i)).toBeInTheDocument();
  });

  it('shows error message when API call fails', async () => {
    api.getSolicitudes.mockRejectedValue(new Error('Network error'));
    renderInbox();
    expect(await screen.findByText(/error al cargar solicitudes/i)).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// MetricsDashboard
// ══════════════════════════════════════════════════════════════════════════════

describe('MetricsDashboard', () => {
  // NOTE: Do NOT use vi.useFakeTimers() here — it blocks waitFor's internal
  // setInterval retries and causes all async assertions to timeout.

  function renderDashboard() {
    return render(
      <MemoryRouter>
        <MetricsDashboard />
      </MemoryRouter>
    );
  }

  it('renders the dashboard title', () => {
    renderDashboard();
    expect(screen.getByText(/panel de métricas/i)).toBeInTheDocument();
  });

  it('calls getMetrics on mount', async () => {
    renderDashboard();
    await waitFor(() => expect(api.getMetrics).toHaveBeenCalledTimes(1));
  });

  it('displays estado KPI cards after data loads', async () => {
    renderDashboard();
    expect(await screen.findByText('Recibida')).toBeInTheDocument();
    expect(screen.getByText('En revisión')).toBeInTheDocument();
    expect(screen.getByText('Resuelta')).toBeInTheDocument();
  });

  it('displays urgencia KPI cards after data loads', async () => {
    renderDashboard();
    expect(await screen.findByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Baja')).toBeInTheDocument();
  });

  it('displays correct count for Recibida (5)', async () => {
    renderDashboard();
    await screen.findByText('Recibida');
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays correct count for En revisión (3)', async () => {
    renderDashboard();
    await screen.findByText('En revisión');
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows total solicitudes count (5+3+2=10)', async () => {
    renderDashboard();
    await screen.findByText('Recibida');
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows error message when getMetrics fails', async () => {
    // Reject with empty object so component falls through to default error string
    api.getMetrics.mockRejectedValue({});
    renderDashboard();
    expect(await screen.findByText(/error al cargar métricas/i)).toBeInTheDocument();
  });

  it('has a refresh/update button', async () => {
    renderDashboard();
    expect(await screen.findByRole('button', { name: /actualizar/i })).toBeInTheDocument();
  });

  it('calls getMetrics again when refresh button is clicked', async () => {
    renderDashboard();
    const btn = await screen.findByRole('button', { name: /actualizar/i });
    api.getMetrics.mockClear();
    api.getMetrics.mockResolvedValue({ data: fakeMetrics });
    fireEvent.click(btn);
    await waitFor(() => expect(api.getMetrics).toHaveBeenCalledTimes(1));
  });

  it('shows "Por Estado" section title', async () => {
    renderDashboard();
    expect(await screen.findByText(/por estado/i)).toBeInTheDocument();
  });

  it('shows "Por Urgencia" section title', async () => {
    renderDashboard();
    expect(await screen.findByText(/por urgencia/i)).toBeInTheDocument();
  });
});

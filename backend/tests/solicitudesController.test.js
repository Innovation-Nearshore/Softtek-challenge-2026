'use strict';

/**
 * Integration-style tests for solicitudes HTTP endpoints (happy path).
 * The service layer is mocked so no DB connection is needed.
 */

// ── Prevent real DB pool from initialising ────────────────────────────────────
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

// ── Mock the service layer ────────────────────────────────────────────────────
jest.mock('../src/services/solicitudesService');
jest.mock('../src/repositories/historialRepository');

const solicitudesService = require('../src/services/solicitudesService');
const historialRepo = require('../src/repositories/historialRepository');

const request = require('supertest');
const app = require('../src/app');

// ── Fixtures ──────────────────────────────────────────────────────────────────
const mockSolicitud = {
  id: 1,
  numeroTicket: 'TKT-20260618-1234',
  titulo: 'PC no enciende',
  descripcion: 'La PC no enciende al presionar el botón de encendido.',
  urgencia: 'Alta',
  estado: 'Recibida',
  solicitante: 'Juan Pérez',
  emailSolicitante: 'juan@empresa.com',
  areaSolicitanteId: 1,
  areaSolicitanteNombre: 'IT',
  tipoSolicitudId: 1,
  tipoSolicitudNombre: 'Soporte Técnico',
  areaAsignadaId: null,
  areaAsignadaNombre: null,
  asignadoA: null,
  fechaCreacion: '2026-06-17T10:00:00.000Z',
  fechaVencimiento: '2026-06-19T10:00:00.000Z',
  fechaResolucion: null,
  solucion: null,
  calificacion: null,
  comentarioCalificacion: null,
  alertaRiesgo: true,
};

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

// ── GET /api/requests ─────────────────────────────────────────────────────────
describe('GET /api/requests (happy path)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with list of solicitudes', async () => {
    solicitudesService.getSolicitudes.mockResolvedValue([mockSolicitud]);

    const res = await request(app).get('/api/requests');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].alertaRiesgo).toBe(true);
  });

  it('passes urgencia filter to the service', async () => {
    solicitudesService.getSolicitudes.mockResolvedValue([mockSolicitud]);

    const res = await request(app).get('/api/requests?urgencia=Alta');

    expect(res.status).toBe(200);
    expect(solicitudesService.getSolicitudes).toHaveBeenCalledWith(
      expect.objectContaining({ urgencia: 'Alta' })
    );
  });

  it('returns empty data array when no solicitudes exist', async () => {
    solicitudesService.getSolicitudes.mockResolvedValue([]);

    const res = await request(app).get('/api/requests');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

// ── GET /api/requests/metrics ─────────────────────────────────────────────────
describe('GET /api/requests/metrics (happy path)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with porEstado, porUrgencia and alertasAltaSinMover', async () => {
    solicitudesService.getMetricas.mockResolvedValue(mockMetricas);

    const res = await request(app).get('/api/requests/metrics');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.porEstado).toHaveLength(3);
    expect(res.body.data.porUrgencia).toHaveLength(3);
    expect(res.body.data.alertasAltaSinMover).toBe(2);
  });

  it('correctly reflects alertasAltaSinMover count in the response', async () => {
    solicitudesService.getMetricas.mockResolvedValue({ ...mockMetricas, alertasAltaSinMover: 5 });

    const res = await request(app).get('/api/requests/metrics');

    expect(res.body.data.alertasAltaSinMover).toBe(5);
  });

  it('returns alertasAltaSinMover = 0 when no high-risk solicitudes exist', async () => {
    solicitudesService.getMetricas.mockResolvedValue({
      porEstado: [],
      porUrgencia: [],
      alertasAltaSinMover: 0,
    });

    const res = await request(app).get('/api/requests/metrics');

    expect(res.status).toBe(200);
    expect(res.body.data.alertasAltaSinMover).toBe(0);
  });

  it('porEstado array has the expected estado keys', async () => {
    solicitudesService.getMetricas.mockResolvedValue(mockMetricas);

    const res = await request(app).get('/api/requests/metrics');
    const estados = res.body.data.porEstado.map((r) => r.estado);

    expect(estados).toContain('Recibida');
    expect(estados).toContain('En revisión');
    expect(estados).toContain('Resuelta');
  });
});

// ── GET /api/requests/:id ─────────────────────────────────────────────────────
describe('GET /api/requests/:id (happy path)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with the solicitud including alertaRiesgo flag', async () => {
    solicitudesService.getSolicitudById.mockResolvedValue(mockSolicitud);

    const res = await request(app).get('/api/requests/1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.alertaRiesgo).toBe(true);
  });
});

// ── POST /api/requests ────────────────────────────────────────────────────────
describe('POST /api/requests (happy path)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a solicitud and returns 201 with the new record', async () => {
    solicitudesService.createSolicitud.mockResolvedValue({
      ...mockSolicitud,
      id: 99,
      numeroTicket: 'TKT-20260618-9999',
    });

    const payload = {
      tipoSolicitudId: 1,
      titulo: 'PC no enciende',
      descripcion: 'La PC no enciende al presionar el botón de encendido.',
      urgencia: 'Alta',
      solicitante: 'Juan Pérez',
      emailSolicitante: 'juan@empresa.com',
      areaSolicitanteId: 1,
    };

    const res = await request(app).post('/api/requests').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(99);
    expect(res.body.data.estado).toBe('Recibida');
  });
});

// ── PATCH /api/requests/:id/status ───────────────────────────────────────────
describe('PATCH /api/requests/:id/status (happy path)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates the estado and returns the updated solicitud', async () => {
    const updated = { ...mockSolicitud, estado: 'En revisión', alertaRiesgo: false };
    solicitudesService.changeStatus.mockResolvedValue(updated);

    const res = await request(app)
      .patch('/api/requests/1/status')
      .send({ estado: 'En revisión', usuario: 'Admin' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.estado).toBe('En revisión');
  });
});

// ── GET /api/requests/:id/history ────────────────────────────────────────────
describe('GET /api/requests/:id/history (happy path)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the historial for a solicitud', async () => {
    solicitudesService.getSolicitudById.mockResolvedValue(mockSolicitud);
    historialRepo.findBySolicitudId.mockResolvedValue([
      {
        id: 1,
        solicitudId: 1,
        estadoAnterior: null,
        estadoNuevo: 'Recibida',
        usuario: 'Juan Pérez',
        comentario: 'Solicitud creada',
        fechaCambio: '2026-06-17T10:00:00.000Z',
      },
    ]);

    const res = await request(app).get('/api/requests/1/history');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].estadoNuevo).toBe('Recibida');
  });
});

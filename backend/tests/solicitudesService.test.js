'use strict';

/**
 * Unit tests for solicitudesService (happy path).
 * All external dependencies (DB pool, repository, historial) are mocked.
 */

// ── Mock the database pool so it never tries to connect ──────────────────────
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn().mockResolvedValue({
    query: jest.fn(),
    release: jest.fn(),
  }),
}));

// ── Mock repositories ────────────────────────────────────────────────────────
jest.mock('../src/repositories/solicitudesRepository');
jest.mock('../src/repositories/historialRepository');
jest.mock('../src/repositories/tiposSolicitudRepository');

const solicitudesRepo = require('../src/repositories/solicitudesRepository');
const historialRepo = require('../src/repositories/historialRepository');
const tiposSolicitudRepo = require('../src/repositories/tiposSolicitudRepository');
const pool = require('../src/config/database');

const solicitudesService = require('../src/services/solicitudesService');

// ── Fixtures ─────────────────────────────────────────────────────────────────
const mockSolicitudBase = {
  id: 1,
  numeroTicket: 'TKT-20260618-1234',
  tipoSolicitudId: 1,
  tipoSolicitudNombre: 'Soporte Técnico',
  titulo: 'PC no enciende',
  descripcion: 'La computadora no enciende al presionar el botón de encendido.',
  urgencia: 'Alta',
  estado: 'Recibida',
  solicitante: 'Juan Pérez',
  emailSolicitante: 'juan@empresa.com',
  areaSolicitanteId: 1,
  areaSolicitanteNombre: 'IT',
  areaAsignadaId: null,
  areaAsignadaNombre: null,
  asignadoA: null,
  fechaCreacion: new Date('2026-06-17T10:00:00Z'), // > 24h ago
  fechaVencimiento: new Date('2026-06-19T10:00:00Z'),
  fechaResolucion: null,
  solucion: null,
  calificacion: null,
  comentarioCalificacion: null,
  alertaRiesgo: true,
};

const mockSolicitudNormal = {
  ...mockSolicitudBase,
  id: 2,
  urgencia: 'Media',
  alertaRiesgo: false,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('solicitudesService – getSolicitudes (happy path)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the list of solicitudes including alertaRiesgo flag', async () => {
    solicitudesRepo.findAll.mockResolvedValue([mockSolicitudBase, mockSolicitudNormal]);

    const result = await solicitudesService.getSolicitudes({});

    expect(solicitudesRepo.findAll).toHaveBeenCalledWith({});
    expect(result).toHaveLength(2);
    expect(result[0].alertaRiesgo).toBe(true);
    expect(result[1].alertaRiesgo).toBe(false);
  });

  it('correctly filters solicitudes by urgencia', async () => {
    solicitudesRepo.findAll.mockResolvedValue([mockSolicitudBase]);

    const result = await solicitudesService.getSolicitudes({ urgencia: 'Alta' });

    expect(solicitudesRepo.findAll).toHaveBeenCalledWith({ urgencia: 'Alta' });
    expect(result).toHaveLength(1);
    expect(result[0].urgencia).toBe('Alta');
  });

  it('returns empty array when there are no matching solicitudes', async () => {
    solicitudesRepo.findAll.mockResolvedValue([]);

    const result = await solicitudesService.getSolicitudes({ urgencia: 'Baja' });

    expect(result).toHaveLength(0);
  });
});

describe('solicitudesService – getSolicitudById (happy path)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns a single solicitud by id with alertaRiesgo flag', async () => {
    solicitudesRepo.findById.mockResolvedValue(mockSolicitudBase);

    const result = await solicitudesService.getSolicitudById(1);

    expect(solicitudesRepo.findById).toHaveBeenCalledWith(1);
    expect(result.id).toBe(1);
    expect(result.alertaRiesgo).toBe(true);
    expect(result.urgencia).toBe('Alta');
    expect(result.estado).toBe('Recibida');
  });
});

describe('solicitudesService – getMetricas (happy path)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns porEstado, porUrgencia and alertasAltaSinMover from repository', async () => {
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

    solicitudesRepo.getMetricas.mockResolvedValue(mockMetricas);

    const result = await solicitudesService.getMetricas();

    expect(solicitudesRepo.getMetricas).toHaveBeenCalledTimes(1);
    expect(result.porEstado).toHaveLength(3);
    expect(result.porUrgencia).toHaveLength(3);
    expect(result.alertasAltaSinMover).toBe(2);
  });

  it('returns alertasAltaSinMover = 0 when no high-risk solicitudes exist', async () => {
    solicitudesRepo.getMetricas.mockResolvedValue({
      porEstado: [],
      porUrgencia: [],
      alertasAltaSinMover: 0,
    });

    const result = await solicitudesService.getMetricas();

    expect(result.alertasAltaSinMover).toBe(0);
  });

  it('porEstado totals reflect correct counts per estado', async () => {
    const porEstado = [
      { estado: 'Recibida', total: 10 },
      { estado: 'En revisión', total: 3 },
      { estado: 'Resuelta', total: 20 },
    ];
    solicitudesRepo.getMetricas.mockResolvedValue({
      porEstado,
      porUrgencia: [],
      alertasAltaSinMover: 1,
    });

    const result = await solicitudesService.getMetricas();
    const recibida = result.porEstado.find((r) => r.estado === 'Recibida');

    expect(recibida.total).toBe(10);
  });

  it('porUrgencia totals reflect correct counts per urgencia level', async () => {
    const porUrgencia = [
      { urgencia: 'Alta', total: 4 },
      { urgencia: 'Media', total: 7 },
      { urgencia: 'Baja', total: 2 },
    ];
    solicitudesRepo.getMetricas.mockResolvedValue({
      porEstado: [],
      porUrgencia,
      alertasAltaSinMover: 0,
    });

    const result = await solicitudesService.getMetricas();
    const alta = result.porUrgencia.find((r) => r.urgencia === 'Alta');

    expect(alta.total).toBe(4);
  });
});

describe('solicitudesService – createSolicitud (happy path)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a solicitud and returns it with the generated ticket number', async () => {
    const mockTipo = { id: 1, nombre: 'Soporte Técnico', slaHoras: 8 };
    tiposSolicitudRepo.getAll.mockResolvedValue([mockTipo]);

    const mockClient = {
      query: jest.fn().mockResolvedValue({}),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);

    const rawCreated = { id: 10 };
    solicitudesRepo.create.mockResolvedValue(rawCreated);
    historialRepo.create.mockResolvedValue({});
    solicitudesRepo.findById.mockResolvedValue({ ...mockSolicitudBase, id: 10 });

    const payload = {
      tipoSolicitudId: 1,
      titulo: 'PC no enciende',
      descripcion: 'La PC no enciende.',
      urgencia: 'Alta',
      solicitante: 'Juan Pérez',
      emailSolicitante: 'juan@empresa.com',
      areaSolicitanteId: 1,
    };

    const result = await solicitudesService.createSolicitud(payload);

    expect(solicitudesRepo.create).toHaveBeenCalledTimes(1);
    expect(historialRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ estadoNuevo: 'Recibida', comentario: 'Solicitud creada' }),
      mockClient
    );
    expect(result.id).toBe(10);
    expect(result.estado).toBe('Recibida');
  });
});

describe('solicitudesService – changeStatus (happy path)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('transitions solicitud from Recibida to En revisión', async () => {
    const solicitudRecibida = { ...mockSolicitudBase, estado: 'Recibida' };
    const solicitudEnRevision = { ...mockSolicitudBase, estado: 'En revisión' };

    solicitudesRepo.findById
      .mockResolvedValueOnce(solicitudRecibida) // initial fetch
      .mockResolvedValueOnce(solicitudEnRevision); // after update

    const mockClient = {
      query: jest.fn().mockResolvedValue({}),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);
    solicitudesRepo.updateStatus.mockResolvedValue({});
    historialRepo.create.mockResolvedValue({});

    const result = await solicitudesService.changeStatus(1, {
      estado: 'En revisión',
      usuario: 'Admin',
    });

    expect(result.estado).toBe('En revisión');
    expect(solicitudesRepo.updateStatus).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ estado: 'En revisión' }),
      mockClient
    );
  });
});

'use strict';

/**
 * Tests for areas, tipos, historial, and metrics routes.
 * The pg pool is mocked so no real database connection is needed.
 */

// ─── Mock pg pool ─────────────────────────────────────────────────────────────
const mockQuery   = jest.fn();
const mockRelease = jest.fn();
const mockClient  = { query: mockQuery, release: mockRelease };
const mockConnect = jest.fn().mockResolvedValue(mockClient);

jest.mock('../db', () => ({
  pool: {
    query:   (...args) => mockQuery(...args),
    connect: (...args) => mockConnect(...args),
  },
}));

const request = require('supertest');
const express = require('express');

const areasRouter     = require('../routes/areas');
const tiposRouter     = require('../routes/tipos');
const historialRouter = require('../routes/historial');
const metricsRouter   = require('../routes/metrics');

// Minimal Express app mounting all four routers
const app = express();
app.use(express.json());
app.use('/api/areas',           areasRouter);
app.use('/api/tipos-solicitud', tiposRouter);
app.use('/api/historial',       historialRouter);
app.use('/api/metrics',         metricsRouter);
app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message });
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/areas
// ══════════════════════════════════════════════════════════════════════════════

describe('GET /api/areas', () => {
  test('returns list of areas', async () => {
    const fakeAreas = [
      { id: 1, nombre: 'IT', descripcion: null, email_contacto: 'it@co.com' },
      { id: 2, nombre: 'RRHH', descripcion: null, email_contacto: 'rrhh@co.com' },
    ];
    mockQuery.mockResolvedValueOnce({ rows: fakeAreas });

    const res = await request(app).get('/api/areas');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('nombre', 'IT');
  });

  test('returns empty array when no areas exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/areas');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns 500 on database error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB connection failed'));

    const res = await request(app).get('/api/areas');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/tipos-solicitud
// ══════════════════════════════════════════════════════════════════════════════

describe('GET /api/tipos-solicitud', () => {
  test('returns list of tipos de solicitud', async () => {
    const fakeTipos = [
      { id: 1, nombre: 'Soporte TI', descripcion: null, sla_horas: 24, requiere_aprobacion: false },
      { id: 2, nombre: 'Compras', descripcion: null, sla_horas: 48, requiere_aprobacion: true },
    ];
    mockQuery.mockResolvedValueOnce({ rows: fakeTipos });

    const res = await request(app).get('/api/tipos-solicitud');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('nombre', 'Soporte TI');
  });

  test('returns empty array when no tipos exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/tipos-solicitud');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns 500 on database error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('Query failed'));

    const res = await request(app).get('/api/tipos-solicitud');

    expect(res.status).toBe(500);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/historial
// ══════════════════════════════════════════════════════════════════════════════

describe('GET /api/historial', () => {
  const fakeHistorial = [
    {
      id: 1,
      solicitud_id: 10,
      estado_anterior: null,
      estado_nuevo: 'Recibida',
      usuario: 'Ana',
      comentario: 'Solicitud creada',
      fecha_cambio: '2026-06-01T10:00:00Z',
      numero_ticket: 'TK2606-001',
      titulo: 'Test',
      urgencia: 'Alta',
      solicitante: 'Ana Garcia',
      tipo_solicitud_nombre: 'Soporte TI',
      area_solicitante_nombre: 'IT',
    },
  ];

  test('returns all historial records without filters', async () => {
    mockQuery.mockResolvedValueOnce({ rows: fakeHistorial });

    const res = await request(app).get('/api/historial');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('numero_ticket', 'TK2606-001');
  });

  test('accepts tipo filter', async () => {
    mockQuery.mockResolvedValueOnce({ rows: fakeHistorial });

    const res = await request(app).get('/api/historial?tipo=Soporte');

    expect(res.status).toBe(200);
    // Ensure the query was called (filter was applied)
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const queryArg = mockQuery.mock.calls[0][0];
    expect(queryArg).toMatch(/ILIKE/);
  });

  test('accepts urgencia filter', async () => {
    mockQuery.mockResolvedValueOnce({ rows: fakeHistorial });

    const res = await request(app).get('/api/historial?urgencia=Alta');

    expect(res.status).toBe(200);
    const paramsArg = mockQuery.mock.calls[0][1];
    expect(paramsArg).toContain('Alta');
  });

  test('accepts responsable filter', async () => {
    mockQuery.mockResolvedValueOnce({ rows: fakeHistorial });

    const res = await request(app).get('/api/historial?responsable=Luis');

    expect(res.status).toBe(200);
    const paramsArg = mockQuery.mock.calls[0][1];
    expect(paramsArg.some(p => p.includes('Luis'))).toBe(true);
  });

  test('accepts estado filter', async () => {
    mockQuery.mockResolvedValueOnce({ rows: fakeHistorial });

    const res = await request(app).get('/api/historial?estado=Resuelta');

    expect(res.status).toBe(200);
    const paramsArg = mockQuery.mock.calls[0][1];
    expect(paramsArg).toContain('Resuelta');
  });

  test('accepts ticket filter', async () => {
    mockQuery.mockResolvedValueOnce({ rows: fakeHistorial });

    const res = await request(app).get('/api/historial?ticket=TK2606');

    expect(res.status).toBe(200);
    const paramsArg = mockQuery.mock.calls[0][1];
    expect(paramsArg.some(p => p.includes('TK2606'))).toBe(true);
  });

  test('accepts multiple combined filters', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/historial?urgencia=Alta&estado=Recibida&responsable=Ana');

    expect(res.status).toBe(200);
    // Three params should have been built
    const paramsArg = mockQuery.mock.calls[0][1];
    expect(paramsArg.length).toBe(3);
  });

  test('returns 500 on database error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('Join failed'));

    const res = await request(app).get('/api/historial');

    expect(res.status).toBe(500);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/metrics
// ══════════════════════════════════════════════════════════════════════════════

describe('GET /api/metrics', () => {
  test('returns by_estado and by_urgencia arrays', async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          { estado: 'Recibida', count: 5 },
          { estado: 'En revisión', count: 3 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { urgencia: 'Alta', count: 2 },
          { urgencia: 'Media', count: 4 },
        ],
      });

    const res = await request(app).get('/api/metrics');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('by_estado');
    expect(res.body).toHaveProperty('by_urgencia');
    expect(Array.isArray(res.body.by_estado)).toBe(true);
    expect(Array.isArray(res.body.by_urgencia)).toBe(true);
  });

  test('by_estado always includes all 3 estados', async () => {
    // Only one estado has records
    mockQuery
      .mockResolvedValueOnce({ rows: [{ estado: 'Recibida', count: 2 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/metrics');

    expect(res.status).toBe(200);
    expect(res.body.by_estado).toHaveLength(3);
    const estados = res.body.by_estado.map(r => r.estado);
    expect(estados).toContain('Recibida');
    expect(estados).toContain('En revisión');
    expect(estados).toContain('Resuelta');
  });

  test('missing estado counts default to 0', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ estado: 'Recibida', count: 7 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/metrics');

    const enRevision = res.body.by_estado.find(r => r.estado === 'En revisión');
    const resuelta   = res.body.by_estado.find(r => r.estado === 'Resuelta');
    expect(enRevision.count).toBe(0);
    expect(resuelta.count).toBe(0);
  });

  test('by_urgencia always includes Alta, Media, Baja', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ urgencia: 'Alta', count: 1 }] });

    const res = await request(app).get('/api/metrics');

    expect(res.body.by_urgencia).toHaveLength(3);
    const urgencias = res.body.by_urgencia.map(r => r.urgencia);
    expect(urgencias).toContain('Alta');
    expect(urgencias).toContain('Media');
    expect(urgencias).toContain('Baja');
  });

  test('missing urgencia counts default to 0', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ urgencia: 'Alta', count: 3 }] });

    const res = await request(app).get('/api/metrics');

    const media = res.body.by_urgencia.find(r => r.urgencia === 'Media');
    const baja  = res.body.by_urgencia.find(r => r.urgencia === 'Baja');
    expect(media.count).toBe(0);
    expect(baja.count).toBe(0);
  });

  test('returns 500 on database error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('Aggregate query failed'));

    const res = await request(app).get('/api/metrics');

    expect(res.status).toBe(500);
  });
});

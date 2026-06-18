'use strict';

/**
 * Backend tests: FSM transitions, ticket format, validation
 * The pg pool is mocked so no real database connection is needed.
 */

// ─── Mock pg pool before any requires ────────────────────────────────────────
const mockQuery  = jest.fn();
const mockRelease = jest.fn();
const mockClient = {
  query:   mockQuery,
  release: mockRelease,
};
const mockConnect = jest.fn().mockResolvedValue(mockClient);

jest.mock('../db', () => ({
  pool: {
    query:   (...args) => mockQuery(...args),
    connect: (...args) => mockConnect(...args),
  },
}));

const request = require('supertest');
const express = require('express');
const solicitudesRouter = require('../routes/solicitudes');

// Minimal Express app for integration-style tests
const app = express();
app.use(express.json());
app.use('/api/solicitudes', solicitudesRouter);
app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message });
});

// ─── Helpers (mirror of route's internal logic for pure unit tests) ──────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URGENCIAS = ['Alta', 'Media', 'Baja'];
const EN_REVISION = 'En revisión';
const FSM_NEXT = {
  'Recibida': EN_REVISION,
  [EN_REVISION]: 'Resuelta',
};

function validateSolicitud(body) {
  const errors = {};
  if (!body.tipo_solicitud_id) errors.tipo_solicitud = 'Campo requerido';
  if (!body.titulo || !body.titulo.trim()) errors.titulo = 'Campo requerido';
  if (!body.descripcion || !body.descripcion.trim()) errors.descripcion = 'Campo requerido';
  if (!body.solicitante || !body.solicitante.trim()) errors.solicitante = 'Campo requerido';
  if (!body.email_solicitante || !body.email_solicitante.trim()) {
    errors.email_solicitante = 'Campo requerido';
  } else if (!EMAIL_RE.test(body.email_solicitante)) {
    errors.email_solicitante = 'Formato de email invalido';
  }
  if (!body.area_solicitante_id) errors.area_solicitante = 'Campo requerido';
  if (body.urgencia && !URGENCIAS.includes(body.urgencia)) {
    errors.urgencia = 'Valor invalido. Debe ser Alta, Media o Baja';
  }
  return Object.keys(errors).length ? errors : null;
}

function generateTicketNumber(date, existingCount) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `TK${yy}${mm}`;
  const seq = existingCount + 1;
  return `${prefix}-${String(seq).padStart(3, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════════
// 1. VALIDATION UNIT TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('validateSolicitud – unit tests', () => {
  const validBody = {
    tipo_solicitud_id: 1,
    titulo: 'Mi titulo',
    descripcion: 'Una descripcion',
    solicitante: 'Juan Perez',
    email_solicitante: 'juan@empresa.com',
    area_solicitante_id: 2,
    urgencia: 'Media',
  };

  test('returns null for a fully valid body', () => {
    expect(validateSolicitud(validBody)).toBeNull();
  });

  test('requires tipo_solicitud_id', () => {
    const errors = validateSolicitud({ ...validBody, tipo_solicitud_id: undefined });
    expect(errors).toHaveProperty('tipo_solicitud');
  });

  test('requires titulo', () => {
    const errors = validateSolicitud({ ...validBody, titulo: '   ' });
    expect(errors).toHaveProperty('titulo');
  });

  test('requires descripcion', () => {
    const errors = validateSolicitud({ ...validBody, descripcion: '' });
    expect(errors).toHaveProperty('descripcion');
  });

  test('requires solicitante', () => {
    const errors = validateSolicitud({ ...validBody, solicitante: '' });
    expect(errors).toHaveProperty('solicitante');
  });

  test('requires email_solicitante', () => {
    const errors = validateSolicitud({ ...validBody, email_solicitante: '' });
    expect(errors).toHaveProperty('email_solicitante');
  });

  test('rejects invalid email format', () => {
    const errors = validateSolicitud({ ...validBody, email_solicitante: 'not-an-email' });
    expect(errors).not.toBeNull();
    expect(errors.email_solicitante).toMatch(/email/i);
  });

  test('accepts valid email formats', () => {
    const emails = ['a@b.com', 'user.name+tag@sub.domain.org', 'x@y.z'];
    emails.forEach(email => {
      expect(validateSolicitud({ ...validBody, email_solicitante: email })).toBeNull();
    });
  });

  test('requires area_solicitante_id', () => {
    const errors = validateSolicitud({ ...validBody, area_solicitante_id: undefined });
    expect(errors).toHaveProperty('area_solicitante');
  });

  test('rejects invalid urgencia values', () => {
    const errors = validateSolicitud({ ...validBody, urgencia: 'Critica' });
    expect(errors).toHaveProperty('urgencia');
  });

  test('accepts valid urgencia values', () => {
    ['Alta', 'Media', 'Baja'].forEach(u => {
      expect(validateSolicitud({ ...validBody, urgencia: u })).toBeNull();
    });
  });

  test('allows missing urgencia (defaults applied by caller)', () => {
    const { urgencia, ...withoutUrgencia } = validBody;
    expect(validateSolicitud(withoutUrgencia)).toBeNull();
  });

  test('returns multiple errors when multiple fields are missing', () => {
    const errors = validateSolicitud({});
    expect(Object.keys(errors).length).toBeGreaterThan(3);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. TICKET FORMAT UNIT TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('generateTicketNumber – unit tests', () => {
  test('produces correct format TK{YY}{MM}-{SEQ:03}', () => {
    const date = new Date(2026, 5, 1); // June 2026
    const ticket = generateTicketNumber(date, 0);
    expect(ticket).toBe('TK2606-001');
  });

  test('pads sequence to 3 digits', () => {
    const date = new Date(2026, 0, 1); // Jan 2026
    expect(generateTicketNumber(date, 0)).toBe('TK2601-001');
    expect(generateTicketNumber(date, 9)).toBe('TK2601-010');
    expect(generateTicketNumber(date, 99)).toBe('TK2601-100');
  });

  test('increments sequence from existing count', () => {
    const date = new Date(2025, 11, 1); // Dec 2025
    expect(generateTicketNumber(date, 4)).toBe('TK2512-005');
  });

  test('matches ticket regex pattern', () => {
    const TICKET_RE = /^TK\d{4}-\d{3,}$/;
    const date = new Date(2026, 3, 15); // April 2026
    expect(generateTicketNumber(date, 0)).toMatch(TICKET_RE);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. FSM TRANSITION LOGIC UNIT TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('FSM transition logic – unit tests', () => {
  test('Recibida transitions to En revisión', () => {
    expect(FSM_NEXT['Recibida']).toBe('En revisión');
  });

  test('En revisión transitions to Resuelta', () => {
    expect(FSM_NEXT['En revisión']).toBe('Resuelta');
  });

  test('Resuelta has no next state (final state)', () => {
    expect(FSM_NEXT['Resuelta']).toBeUndefined();
  });

  test('cannot skip directly from Recibida to Resuelta', () => {
    const estadoActual = 'Recibida';
    const nextEstado = FSM_NEXT[estadoActual];
    expect(nextEstado).not.toBe('Resuelta');
  });

  test('cannot revert from En revisión to Recibida', () => {
    const REVERSE = { 'En revisión': 'Recibida', 'Resuelta': 'En revisión' };
    // FSM_NEXT should not contain reverse mappings
    expect(FSM_NEXT['En revisión']).not.toBe('Recibida');
    // Reverse map should not be in FSM_NEXT
    Object.values(REVERSE).forEach(revertTarget => {
      const keys = Object.keys(FSM_NEXT);
      const forwardValues = Object.values(FSM_NEXT);
      // revertTarget should only appear as a key (source), not reachable from "later" states
      expect(forwardValues.filter(v => v === 'Recibida').length).toBe(0);
    });
  });

  test('FSM has exactly 2 valid transitions', () => {
    expect(Object.keys(FSM_NEXT).length).toBe(2);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. POST /api/solicitudes – integration tests (mocked DB)
// ══════════════════════════════════════════════════════════════════════════════

describe('POST /api/solicitudes – validation via HTTP', () => {
  test('returns 422 when required fields are missing', async () => {
    const res = await request(app).post('/api/solicitudes').send({});
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });

  test('returns 422 for invalid email', async () => {
    const res = await request(app).post('/api/solicitudes').send({
      tipo_solicitud_id: 1,
      titulo: 'Test',
      descripcion: 'Desc',
      solicitante: 'Ana',
      email_solicitante: 'bad-email',
      area_solicitante_id: 1,
    });
    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('email_solicitante');
  });

  test('returns 422 for invalid urgencia value', async () => {
    const res = await request(app).post('/api/solicitudes').send({
      tipo_solicitud_id: 1,
      titulo: 'Test',
      descripcion: 'Desc',
      solicitante: 'Ana',
      email_solicitante: 'ana@test.com',
      area_solicitante_id: 1,
      urgencia: 'Urgentisima',
    });
    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('urgencia');
  });

  test('creates solicitud and returns ticket on valid payload', async () => {
    // Mock: generateTicket SELECT COUNT(*) → 0 rows count
    mockQuery
      .mockResolvedValueOnce({ rows: [{ count: '0' }] })          // BEGIN
      .mockResolvedValueOnce({ rows: [{ count: '0' }] })          // COUNT for ticket
      .mockResolvedValueOnce({ rows: [{ id: 1, numero_ticket: 'TK2606-001' }] }) // INSERT solicitudes
      .mockResolvedValueOnce({ rows: [] })                         // INSERT historial
      .mockResolvedValueOnce({ rows: [] });                        // COMMIT

    // Override connect to return mock client with sequential responses
    mockQuery.mockReset();
    mockQuery
      .mockResolvedValueOnce({ rows: [] })                         // BEGIN
      .mockResolvedValueOnce({ rows: [{ count: '0' }] })          // COUNT for ticket
      .mockResolvedValueOnce({ rows: [{ id: 1, numero_ticket: 'TK2606-001' }] }) // INSERT solicitudes
      .mockResolvedValueOnce({ rows: [] })                         // INSERT historial
      .mockResolvedValueOnce({ rows: [] });                        // COMMIT

    const res = await request(app).post('/api/solicitudes').send({
      tipo_solicitud_id: 1,
      titulo: 'Solicitud de prueba',
      descripcion: 'Descripcion de prueba',
      solicitante: 'Ana Garcia',
      email_solicitante: 'ana@empresa.com',
      area_solicitante_id: 2,
      urgencia: 'Media',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('numero_ticket');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. PATCH /api/solicitudes/:id/estado – FSM integration tests (mocked DB)
// ══════════════════════════════════════════════════════════════════════════════

describe('PATCH /api/solicitudes/:id/estado – FSM via HTTP', () => {
  test('returns 404 when solicitud does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).patch('/api/solicitudes/999/estado').send({ responsable: 'Luis' });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 422 when solicitud is already in final state (Resuelta)', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1, estado: 'Resuelta', solicitante: 'Ana' }],
    });
    const res = await request(app).patch('/api/solicitudes/1/estado').send({ responsable: 'Luis' });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/estado final/i);
  });

  test('returns 422 when transitioning to En revisión without responsable', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 2, estado: 'Recibida', solicitante: 'Maria' }],
    });
    const res = await request(app).patch('/api/solicitudes/2/estado').send({});
    expect(res.status).toBe(422);
    expect(res.body.errors).toHaveProperty('responsable');
  });

  test('transitions Recibida → En revisión successfully', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 3, estado: 'Recibida', solicitante: 'Carlos' }] }) // SELECT current
      .mockResolvedValueOnce({ rows: [] })   // BEGIN
      .mockResolvedValueOnce({ rows: [] })   // UPDATE solicitudes
      .mockResolvedValueOnce({ rows: [] })   // INSERT historial
      .mockResolvedValueOnce({ rows: [] });  // COMMIT

    const res = await request(app)
      .patch('/api/solicitudes/3/estado')
      .send({ responsable: 'Luis Lopez' });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('En revisión');
  });

  test('transitions En revisión → Resuelta successfully', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 4, estado: 'En revisión', solicitante: 'Pedro' }] }) // SELECT current
      .mockResolvedValueOnce({ rows: [] })   // BEGIN
      .mockResolvedValueOnce({ rows: [] })   // UPDATE solicitudes
      .mockResolvedValueOnce({ rows: [] })   // INSERT historial
      .mockResolvedValueOnce({ rows: [] });  // COMMIT

    const res = await request(app)
      .patch('/api/solicitudes/4/estado')
      .send({ responsable: 'Luis Lopez' });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('Resuelta');
  });
});

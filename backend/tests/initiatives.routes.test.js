/**
 * Integration-style route tests using supertest.
 * The database pool is mocked — no real PostgreSQL connection is made.
 */

// ── Mock the pool BEFORE requiring the app ───────────────────────────────────
jest.mock('../src/db/pool', () => ({
  query: jest.fn(),
}));

const request  = require('supertest');
const pool     = require('../src/db/pool');
const app      = require('../src/server');

beforeEach(() => {
  jest.clearAllMocks();
});

// ════════════════════════════════════════════════════════════════════════════
// GET /api/initiatives
// ════════════════════════════════════════════════════════════════════════════
describe('GET /api/initiatives', () => {
  it('returns 200 with an array of initiatives', async () => {
    const rows = [
      { id: 1, nombre: 'Init A', estado: 'Pendiente', prioridad: 'Alta' },
      { id: 2, nombre: 'Init B', estado: 'En curso',  prioridad: 'Baja' },
    ];
    pool.query.mockResolvedValueOnce({ rows });

    const res = await request(app).get('/api/initiatives');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(rows);
  });

  it('returns 200 with empty array when no initiatives exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/initiatives');

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('supports ?estado= query param', async () => {
    const rows = [{ id: 3, nombre: 'Init C', estado: 'Completado' }];
    pool.query.mockResolvedValueOnce({ rows });

    const res = await request(app).get('/api/initiatives?estado=Completado');

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(rows);
    // Ensure the filtered query was called with estado param
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it('supports ?prioridad= query param', async () => {
    const rows = [{ id: 4, nombre: 'Init D', prioridad: 'Media' }];
    pool.query.mockResolvedValueOnce({ rows });

    const res = await request(app).get('/api/initiatives?prioridad=Media');

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(rows);
  });

  it('supports combined ?estado=&prioridad= query params', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/initiatives?estado=Pendiente&prioridad=Alta');

    expect(res.statusCode).toBe(200);
  });

  it('returns 500 when the database fails', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB Error'));

    const res = await request(app).get('/api/initiatives');

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/initiatives
// ════════════════════════════════════════════════════════════════════════════
describe('POST /api/initiatives', () => {
  const validBody = {
    nombre: 'Nueva iniciativa',
    responsable: 'Ana López',
    estado: 'Pendiente',
    fecha_limite: '2025-12-31',
    prioridad: 'Media',
    descripcion: 'Descripción de prueba',
  };

  it('returns 201 with the created initiative for valid input', async () => {
    const newRow = { id: 20, ...validBody };
    pool.query.mockResolvedValueOnce({ rows: [newRow] });

    const res = await request(app)
      .post('/api/initiatives')
      .send(validBody)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(newRow);
  });

  it('returns 201 without optional descripcion field', async () => {
    const { descripcion, ...bodyWithoutDesc } = validBody;
    const newRow = { id: 21, ...bodyWithoutDesc, descripcion: null };
    pool.query.mockResolvedValueOnce({ rows: [newRow] });

    const res = await request(app)
      .post('/api/initiatives')
      .send(bodyWithoutDesc);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 when nombre is missing', async () => {
    const { nombre, ...body } = validBody;

    const res = await request(app).post('/api/initiatives').send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('returns 400 when responsable is missing', async () => {
    const { responsable, ...body } = validBody;

    const res = await request(app).post('/api/initiatives').send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when estado is missing', async () => {
    const { estado, ...body } = validBody;

    const res = await request(app).post('/api/initiatives').send(body);

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when fecha_limite is missing', async () => {
    const { fecha_limite, ...body } = validBody;

    const res = await request(app).post('/api/initiatives').send(body);

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when prioridad is missing', async () => {
    const { prioridad, ...body } = validBody;

    const res = await request(app).post('/api/initiatives').send(body);

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for invalid estado value', async () => {
    const res = await request(app)
      .post('/api/initiatives')
      .send({ ...validBody, estado: 'Desconocido' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid prioridad value', async () => {
    const res = await request(app)
      .post('/api/initiatives')
      .send({ ...validBody, prioridad: 'Urgente' });

    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('returns 500 when database insert fails', async () => {
    pool.query.mockRejectedValueOnce(new Error('Insert error'));

    const res = await request(app).post('/api/initiatives').send(validBody);

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// PATCH /api/initiatives/:id/estado
// ════════════════════════════════════════════════════════════════════════════
describe('PATCH /api/initiatives/:id/estado', () => {
  it('returns 200 with updated row for valid estado', async () => {
    const updatedRow = { id: 7, estado: 'En curso' };
    pool.query.mockResolvedValueOnce({ rows: [updatedRow], rowCount: 1 });

    const res = await request(app)
      .patch('/api/initiatives/7/estado')
      .send({ estado: 'En curso' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(updatedRow);
  });

  it('returns 400 when estado is missing from body', async () => {
    const res = await request(app)
      .patch('/api/initiatives/7/estado')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid estado value', async () => {
    const res = await request(app)
      .patch('/api/initiatives/7/estado')
      .send({ estado: 'Borrador' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 404 when initiative id does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .patch('/api/initiatives/9999/estado')
      .send({ estado: 'Completado' });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 500 when database update fails', async () => {
    pool.query.mockRejectedValueOnce(new Error('Update error'));

    const res = await request(app)
      .patch('/api/initiatives/7/estado')
      .send({ estado: 'Pendiente' });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('accepts all three valid estado values', async () => {
    const validEstados = ['Pendiente', 'En curso', 'Completado'];

    for (const estado of validEstados) {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, estado }], rowCount: 1 });

      const res = await request(app)
        .patch('/api/initiatives/1/estado')
        .send({ estado });

      expect(res.statusCode).toBe(200);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
// PATCH /api/initiatives/:id  (inline field update)
// ════════════════════════════════════════════════════════════════════════════
describe('PATCH /api/initiatives/:id (inline field update)', () => {
  it('returns 200 when updating nombre only', async () => {
    const updatedRow = { id: 4, nombre: 'Nombre Actualizado' };
    pool.query.mockResolvedValueOnce({ rows: [updatedRow], rowCount: 1 });

    const res = await request(app)
      .patch('/api/initiatives/4')
      .send({ nombre: 'Nombre Actualizado' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(updatedRow);
  });

  it('returns 200 when updating responsable only', async () => {
    const updatedRow = { id: 4, responsable: 'Pedro Ramírez' };
    pool.query.mockResolvedValueOnce({ rows: [updatedRow], rowCount: 1 });

    const res = await request(app)
      .patch('/api/initiatives/4')
      .send({ responsable: 'Pedro Ramírez' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 200 when updating prioridad only', async () => {
    const updatedRow = { id: 4, prioridad: 'Alta' };
    pool.query.mockResolvedValueOnce({ rows: [updatedRow], rowCount: 1 });

    const res = await request(app)
      .patch('/api/initiatives/4')
      .send({ prioridad: 'Alta' });

    expect(res.statusCode).toBe(200);
  });

  it('returns 200 when updating multiple fields at once', async () => {
    const updatedRow = { id: 4, nombre: 'Multi', responsable: 'Ana', prioridad: 'Baja' };
    pool.query.mockResolvedValueOnce({ rows: [updatedRow], rowCount: 1 });

    const res = await request(app)
      .patch('/api/initiatives/4')
      .send({ nombre: 'Multi', responsable: 'Ana', prioridad: 'Baja' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(updatedRow);
  });

  it('returns 400 when no valid fields are provided', async () => {
    const res = await request(app)
      .patch('/api/initiatives/4')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('returns 400 when nombre is empty string', async () => {
    const res = await request(app)
      .patch('/api/initiatives/4')
      .send({ nombre: '   ' });

    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('returns 400 when prioridad value is invalid', async () => {
    const res = await request(app)
      .patch('/api/initiatives/4')
      .send({ prioridad: 'Máxima' });

    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('returns 404 when initiative is not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .patch('/api/initiatives/9999')
      .send({ nombre: 'No existe' });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 500 when database update fails', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB Error'));

    const res = await request(app)
      .patch('/api/initiatives/4')
      .send({ nombre: 'Fallo' });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Health check & 404 fallback
// ════════════════════════════════════════════════════════════════════════════
describe('Utility routes', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

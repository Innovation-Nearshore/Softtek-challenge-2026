/**
 * Unit tests for initiatives.controller.js
 * All database calls are mocked — no real PostgreSQL connection is needed.
 */

// ── Mock the pool BEFORE requiring the controller ───────────────────────────
jest.mock('../src/db/pool', () => ({
  query: jest.fn(),
}));

const pool = require('../src/db/pool');
const {
  getInitiatives,
  createInitiative,
  updateInitiativeEstado,
  updateInitiativeFields,
} = require('../src/controllers/initiatives.controller');

// ── Helpers ──────────────────────────────────────────────────────────────────
const mockReq = (overrides = {}) => ({
  query: {},
  params: {},
  body: {},
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ════════════════════════════════════════════════════════════════════════════
// getInitiatives
// ════════════════════════════════════════════════════════════════════════════
describe('getInitiatives', () => {
  it('returns 200 with all initiatives when no filters are provided', async () => {
    const fakeRows = [{ id: 1, nombre: 'Test', estado: 'Pendiente' }];
    pool.query.mockResolvedValueOnce({ rows: fakeRows });

    const req = mockReq();
    const res = mockRes();

    await getInitiatives(req, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeRows });
  });

  it('returns 200 with filtered initiatives when estado filter is provided', async () => {
    const fakeRows = [{ id: 2, nombre: 'Filtrada', estado: 'En curso' }];
    pool.query.mockResolvedValueOnce({ rows: fakeRows });

    const req = mockReq({ query: { estado: 'En curso' } });
    const res = mockRes();

    await getInitiatives(req, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeRows });
  });

  it('returns 200 with filtered initiatives when prioridad filter is provided', async () => {
    const fakeRows = [{ id: 3, nombre: 'Alta prioridad', prioridad: 'Alta' }];
    pool.query.mockResolvedValueOnce({ rows: fakeRows });

    const req = mockReq({ query: { prioridad: 'Alta' } });
    const res = mockRes();

    await getInitiatives(req, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 200 with empty array when no initiatives exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq();
    const res = mockRes();

    await getInitiatives(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
  });

  it('returns 500 when the database throws an error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB connection failed'));

    const req = mockReq();
    const res = mockRes();

    await getInitiatives(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error al obtener iniciativas.',
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// createInitiative
// ════════════════════════════════════════════════════════════════════════════
describe('createInitiative', () => {
  const validBody = {
    nombre: 'Nueva iniciativa',
    responsable: 'Juan Pérez',
    estado: 'Pendiente',
    fecha_limite: '2025-12-31',
    prioridad: 'Alta',
    descripcion: 'Una descripción',
  };

  it('returns 201 with the created initiative on valid input', async () => {
    const newRow = { id: 10, ...validBody };
    pool.query.mockResolvedValueOnce({ rows: [newRow] });

    const req = mockReq({ body: validBody });
    const res = mockRes();

    await createInitiative(req, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: newRow });
  });

  it('returns 400 when nombre is missing', async () => {
    const { nombre, ...bodyWithoutNombre } = validBody;
    const req = mockReq({ body: bodyWithoutNombre });
    const res = mockRes();

    await createInitiative(req, res);

    expect(pool.query).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when responsable is missing', async () => {
    const { responsable, ...body } = validBody;
    const req = mockReq({ body });
    const res = mockRes();

    await createInitiative(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when estado is missing', async () => {
    const { estado, ...body } = validBody;
    const req = mockReq({ body });
    const res = mockRes();

    await createInitiative(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when fecha_limite is missing', async () => {
    const { fecha_limite, ...body } = validBody;
    const req = mockReq({ body });
    const res = mockRes();

    await createInitiative(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when prioridad is missing', async () => {
    const { prioridad, ...body } = validBody;
    const req = mockReq({ body });
    const res = mockRes();

    await createInitiative(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when estado has an invalid value', async () => {
    const req = mockReq({ body: { ...validBody, estado: 'Invalido' } });
    const res = mockRes();

    await createInitiative(req, res);

    expect(pool.query).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it('returns 400 when prioridad has an invalid value', async () => {
    const req = mockReq({ body: { ...validBody, prioridad: 'Urgente' } });
    const res = mockRes();

    await createInitiative(req, res);

    expect(pool.query).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates initiative without descripcion (nullable field)', async () => {
    const { descripcion, ...bodyWithoutDesc } = validBody;
    const newRow = { id: 11, ...bodyWithoutDesc, descripcion: null };
    pool.query.mockResolvedValueOnce({ rows: [newRow] });

    const req = mockReq({ body: bodyWithoutDesc });
    const res = mockRes();

    await createInitiative(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 500 when the database throws an error', async () => {
    pool.query.mockRejectedValueOnce(new Error('Insert failed'));

    const req = mockReq({ body: validBody });
    const res = mockRes();

    await createInitiative(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error al crear la iniciativa.',
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// updateInitiativeEstado
// ════════════════════════════════════════════════════════════════════════════
describe('updateInitiativeEstado', () => {
  it('returns 200 with updated row on valid estado', async () => {
    const updatedRow = { id: 5, estado: 'Completado' };
    pool.query.mockResolvedValueOnce({ rows: [updatedRow], rowCount: 1 });

    const req = mockReq({ params: { id: '5' }, body: { estado: 'Completado' } });
    const res = mockRes();

    await updateInitiativeEstado(req, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedRow });
  });

  it('returns 400 when estado is missing', async () => {
    const req = mockReq({ params: { id: '5' }, body: {} });
    const res = mockRes();

    await updateInitiativeEstado(req, res);

    expect(pool.query).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when estado value is invalid', async () => {
    const req = mockReq({ params: { id: '5' }, body: { estado: 'Archivado' } });
    const res = mockRes();

    await updateInitiativeEstado(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it('returns 404 when initiative is not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const req = mockReq({ params: { id: '999' }, body: { estado: 'Pendiente' } });
    const res = mockRes();

    await updateInitiativeEstado(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Iniciativa no encontrada.',
    });
  });

  it('returns 500 when database throws an error', async () => {
    pool.query.mockRejectedValueOnce(new Error('Update failed'));

    const req = mockReq({ params: { id: '5' }, body: { estado: 'En curso' } });
    const res = mockRes();

    await updateInitiativeEstado(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error al actualizar el estado.',
    });
  });

  it('accepts all three valid estado values', async () => {
    const validEstados = ['Pendiente', 'En curso', 'Completado'];

    for (const estado of validEstados) {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, estado }], rowCount: 1 });

      const req = mockReq({ params: { id: '1' }, body: { estado } });
      const res = mockRes();

      await updateInitiativeEstado(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
// updateInitiativeFields
// ════════════════════════════════════════════════════════════════════════════
describe('updateInitiativeFields', () => {
  it('returns 200 when updating nombre only', async () => {
    const updatedRow = { id: 3, nombre: 'Nuevo nombre' };
    pool.query.mockResolvedValueOnce({ rows: [updatedRow], rowCount: 1 });

    const req = mockReq({ params: { id: '3' }, body: { nombre: 'Nuevo nombre' } });
    const res = mockRes();

    await updateInitiativeFields(req, res);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedRow });
  });

  it('returns 200 when updating responsable only', async () => {
    const updatedRow = { id: 3, responsable: 'María García' };
    pool.query.mockResolvedValueOnce({ rows: [updatedRow], rowCount: 1 });

    const req = mockReq({ params: { id: '3' }, body: { responsable: 'María García' } });
    const res = mockRes();

    await updateInitiativeFields(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 200 when updating prioridad only', async () => {
    const updatedRow = { id: 3, prioridad: 'Baja' };
    pool.query.mockResolvedValueOnce({ rows: [updatedRow], rowCount: 1 });

    const req = mockReq({ params: { id: '3' }, body: { prioridad: 'Baja' } });
    const res = mockRes();

    await updateInitiativeFields(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 200 when updating multiple fields at once', async () => {
    const updatedRow = { id: 3, nombre: 'Multi', responsable: 'Carlos', prioridad: 'Media' };
    pool.query.mockResolvedValueOnce({ rows: [updatedRow], rowCount: 1 });

    const req = mockReq({
      params: { id: '3' },
      body: { nombre: 'Multi', responsable: 'Carlos', prioridad: 'Media' },
    });
    const res = mockRes();

    await updateInitiativeFields(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedRow });
  });

  it('returns 400 when no valid fields are provided', async () => {
    const req = mockReq({ params: { id: '3' }, body: {} });
    const res = mockRes();

    await updateInitiativeFields(req, res);

    expect(pool.query).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it('returns 400 when nombre is an empty string', async () => {
    const req = mockReq({ params: { id: '3' }, body: { nombre: '   ' } });
    const res = mockRes();

    await updateInitiativeFields(req, res);

    expect(pool.query).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when responsable is an empty string', async () => {
    const req = mockReq({ params: { id: '3' }, body: { responsable: '' } });
    const res = mockRes();

    await updateInitiativeFields(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when prioridad has an invalid value', async () => {
    const req = mockReq({ params: { id: '3' }, body: { prioridad: 'Crítica' } });
    const res = mockRes();

    await updateInitiativeFields(req, res);

    expect(pool.query).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when initiative is not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const req = mockReq({ params: { id: '999' }, body: { nombre: 'X' } });
    const res = mockRes();

    await updateInitiativeFields(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Iniciativa no encontrada.',
    });
  });

  it('returns 500 when database throws an error', async () => {
    pool.query.mockRejectedValueOnce(new Error('Update failed'));

    const req = mockReq({ params: { id: '3' }, body: { nombre: 'X' } });
    const res = mockRes();

    await updateInitiativeFields(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error al actualizar los campos.',
    });
  });
});

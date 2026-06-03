'use strict';

jest.mock('../../services/periodosService');

const request = require('supertest');
const app = require('../../index');
const PeriodosService = require('../../services/periodosService');

const samplePeriodo = {
  id: 1,
  anio: 2024,
  mes: 6,
  nombre_mes: 'Junio',
  trimestre: 2,
  fecha_inicio: '2024-06-01',
  fecha_fin: '2024-06-30',
};

beforeEach(() => jest.clearAllMocks());

describe('GET /api/periodos', () => {
  it('returns 200 with a list of periods', async () => {
    PeriodosService.getAll.mockResolvedValueOnce([samplePeriodo]);
    const res = await request(app).get('/api/periodos');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([samplePeriodo]);
  });

  it('returns 500 when service throws an unexpected error', async () => {
    PeriodosService.getAll.mockRejectedValueOnce(new Error('DB failure'));
    const res = await request(app).get('/api/periodos');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/periodos/:id', () => {
  it('returns 200 with the period when found', async () => {
    PeriodosService.getById.mockResolvedValueOnce(samplePeriodo);
    const res = await request(app).get('/api/periodos/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(samplePeriodo);
  });

  it('returns 404 when period is not found', async () => {
    const err = new Error('Período no encontrado');
    err.status = 404;
    PeriodosService.getById.mockRejectedValueOnce(err);
    const res = await request(app).get('/api/periodos/999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/periodos', () => {
  it('returns 201 with the upserted period', async () => {
    PeriodosService.upsert.mockResolvedValueOnce(samplePeriodo);
    const res = await request(app)
      .post('/api/periodos')
      .send(samplePeriodo);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(samplePeriodo);
  });

  it('returns 400 when anio is missing', async () => {
    const err = new Error('anio y mes son requeridos');
    err.status = 400;
    PeriodosService.upsert.mockRejectedValueOnce(err);
    const res = await request(app)
      .post('/api/periodos')
      .send({ mes: 6 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/periodos/:id', () => {
  it('returns 200 with the deleted period', async () => {
    PeriodosService.delete.mockResolvedValueOnce(samplePeriodo);
    const res = await request(app).delete('/api/periodos/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(samplePeriodo);
  });

  it('returns 404 when the period to delete is not found', async () => {
    const err = new Error('Período no encontrado');
    err.status = 404;
    PeriodosService.delete.mockRejectedValueOnce(err);
    const res = await request(app).delete('/api/periodos/999');
    expect(res.status).toBe(404);
  });
});

'use strict';

jest.mock('../../services/metricasService');

const request = require('supertest');
const app = require('../../index');
const MetricasService = require('../../services/metricasService');

const sampleMetrica = {
  id: 1,
  periodo_id: 1,
  categoria_id: 1,
  nombre_metrica: 'Ingresos',
  valor_actual: 5000,
  valor_objetivo: 4500,
  unidad: 'USD',
  notas: null,
};

beforeEach(() => jest.clearAllMocks());

describe('GET /api/metricas', () => {
  it('returns 200 with a list of metrics', async () => {
    MetricasService.getAll.mockResolvedValueOnce([sampleMetrica]);
    const res = await request(app).get('/api/metricas');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([sampleMetrica]);
  });

  it('passes filters parsed from query string to service', async () => {
    MetricasService.getAll.mockResolvedValueOnce([]);
    await request(app).get('/api/metricas?periodo_id=1&categoria_id=2&anio=2024&trimestre=2');
    expect(MetricasService.getAll).toHaveBeenCalledWith({
      periodo_id: 1,
      categoria_id: 2,
      anio: 2024,
      trimestre: 2,
    });
  });

  it('returns 500 on unexpected error', async () => {
    MetricasService.getAll.mockRejectedValueOnce(new Error('fail'));
    const res = await request(app).get('/api/metricas');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/metricas/summary', () => {
  it('returns 200 with summary data', async () => {
    const summary = [{ categoria: 'Ventas', total_metricas: '5' }];
    MetricasService.getSummary.mockResolvedValueOnce(summary);
    const res = await request(app).get('/api/metricas/resumen');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(summary);
  });

  it('passes filters from query to service', async () => {
    MetricasService.getSummary.mockResolvedValueOnce([]);
    await request(app).get('/api/metricas/resumen?anio=2024&trimestre=1&periodo_id=3');
    expect(MetricasService.getSummary).toHaveBeenCalledWith({
      anio: 2024,
      trimestre: 1,
      periodo_id: 3,
    });
  });
});

describe('GET /api/metricas/:id', () => {
  it('returns 200 with the metric when found', async () => {
    MetricasService.getById.mockResolvedValueOnce(sampleMetrica);
    const res = await request(app).get('/api/metricas/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(sampleMetrica);
  });

  it('returns 404 when metric is not found', async () => {
    const err = new Error('Métrica no encontrada');
    err.status = 404;
    MetricasService.getById.mockRejectedValueOnce(err);
    const res = await request(app).get('/api/metricas/999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/metricas', () => {
  it('returns 201 with the created metric', async () => {
    MetricasService.create.mockResolvedValueOnce(sampleMetrica);
    const res = await request(app).post('/api/metricas').send(sampleMetrica);
    expect(res.status).toBe(201);
    expect(res.body.data).toEqual(sampleMetrica);
  });

  it('returns 400 when required fields are missing', async () => {
    const err = new Error('periodo_id es requerido');
    err.status = 400;
    MetricasService.create.mockRejectedValueOnce(err);
    const res = await request(app).post('/api/metricas').send({});
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/metricas/:id', () => {
  it('returns 200 with the updated metric', async () => {
    const updated = { ...sampleMetrica, valor_actual: 9999 };
    MetricasService.update.mockResolvedValueOnce(updated);
    const res = await request(app).put('/api/metricas/1').send({ valor_actual: 9999 });
    expect(res.status).toBe(200);
    expect(res.body.data.valor_actual).toBe(9999);
  });

  it('returns 404 when metric is not found', async () => {
    const err = new Error('Métrica no encontrada');
    err.status = 404;
    MetricasService.update.mockRejectedValueOnce(err);
    const res = await request(app).put('/api/metricas/999').send({ valor_actual: 1 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/metricas/:id', () => {
  it('returns 200 with the deleted metric', async () => {
    MetricasService.delete.mockResolvedValueOnce(sampleMetrica);
    const res = await request(app).delete('/api/metricas/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(sampleMetrica);
  });

  it('returns 404 when metric is not found', async () => {
    const err = new Error('Métrica no encontrada');
    err.status = 404;
    MetricasService.delete.mockRejectedValueOnce(err);
    const res = await request(app).delete('/api/metricas/999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/metricas/upload-csv', () => {
  it('returns 400 when no file is provided', async () => {
    // Send a proper multipart request with no file attached
    const res = await request(app)
      .post('/api/metricas/upload-csv')
      .field('dummy', 'value'); // multipart request without the 'file' field
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/archivo CSV/);
  });
});

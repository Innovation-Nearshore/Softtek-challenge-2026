'use strict';

jest.mock('../../services/categoriasService');

const request = require('supertest');
const app = require('../../index');
const CategoriasService = require('../../services/categoriasService');

const sampleCategoria = { id: 1, nombre: 'Ventas', descripcion: 'Desc', color_hex: '#FF0000' };

beforeEach(() => jest.clearAllMocks());

describe('GET /api/categorias', () => {
  it('returns 200 with a list of categories', async () => {
    CategoriasService.getAll.mockResolvedValueOnce([sampleCategoria]);
    const res = await request(app).get('/api/categorias');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([sampleCategoria]);
  });

  it('returns 500 when service throws an unexpected error', async () => {
    CategoriasService.getAll.mockRejectedValueOnce(new Error('DB failure'));
    const res = await request(app).get('/api/categorias');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/categorias/:id', () => {
  it('returns 200 with the category when found', async () => {
    CategoriasService.getById.mockResolvedValueOnce(sampleCategoria);
    const res = await request(app).get('/api/categorias/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(sampleCategoria);
  });

  it('returns 404 when category is not found', async () => {
    const err = new Error('Categoría no encontrada');
    err.status = 404;
    CategoriasService.getById.mockRejectedValueOnce(err);
    const res = await request(app).get('/api/categorias/999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/categorias', () => {
  it('returns 201 with the created category', async () => {
    CategoriasService.create.mockResolvedValueOnce(sampleCategoria);
    const res = await request(app)
      .post('/api/categorias')
      .send({ nombre: 'Ventas', color_hex: '#FF0000' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(sampleCategoria);
  });

  it('returns 400 when nombre is missing', async () => {
    const err = new Error('nombre es requerido');
    err.status = 400;
    CategoriasService.create.mockRejectedValueOnce(err);
    const res = await request(app).post('/api/categorias').send({ nombre: '' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when a duplicate nombre (pg 23505) is detected', async () => {
    const err = new Error('duplicate key');
    err.code = '23505';
    CategoriasService.create.mockRejectedValueOnce(err);
    const res = await request(app).post('/api/categorias').send({ nombre: 'Ventas' });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/categorias/:id', () => {
  it('returns 200 with the updated category', async () => {
    const updated = { ...sampleCategoria, nombre: 'Marketing' };
    CategoriasService.update.mockResolvedValueOnce(updated);
    const res = await request(app)
      .put('/api/categorias/1')
      .send({ nombre: 'Marketing' });
    expect(res.status).toBe(200);
    expect(res.body.data.nombre).toBe('Marketing');
  });

  it('returns 404 when the category to update is not found', async () => {
    const err = new Error('Categoría no encontrada');
    err.status = 404;
    CategoriasService.update.mockRejectedValueOnce(err);
    const res = await request(app).put('/api/categorias/999').send({ nombre: 'X' });
    expect(res.status).toBe(404);
  });

  it('returns 409 for duplicate key on update', async () => {
    const err = new Error('duplicate key');
    err.code = '23505';
    CategoriasService.update.mockRejectedValueOnce(err);
    const res = await request(app).put('/api/categorias/1').send({ nombre: 'Ventas' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/categorias/:id', () => {
  it('returns 200 with the deleted category', async () => {
    CategoriasService.delete.mockResolvedValueOnce(sampleCategoria);
    const res = await request(app).delete('/api/categorias/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(sampleCategoria);
  });

  it('returns 404 when the category to delete is not found', async () => {
    const err = new Error('Categoría no encontrada');
    err.status = 404;
    CategoriasService.delete.mockRejectedValueOnce(err);
    const res = await request(app).delete('/api/categorias/999');
    expect(res.status).toBe(404);
  });

  it('returns 409 when the category has associated metrics (FK 23503)', async () => {
    const err = new Error('FK violation');
    err.code = '23503';
    CategoriasService.delete.mockRejectedValueOnce(err);
    const res = await request(app).delete('/api/categorias/1');
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/métricas asociadas/);
  });
});

'use strict';

// Mock the database pool before requiring the repository
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const pool = require('../../config/database');
const CategoriasRepository = require('../../repositories/categoriasRepository');

const sampleCategoria = {
  id: 1,
  nombre: 'Ventas',
  descripcion: 'Métricas de ventas',
  color_hex: '#FF0000',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CategoriasRepository.findAll', () => {
  it('returns all categories ordered by nombre', async () => {
    pool.query.mockResolvedValueOnce({ rows: [sampleCategoria] });
    const result = await CategoriasRepository.findAll();
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY nombre')
    );
    expect(result).toEqual([sampleCategoria]);
  });

  it('returns empty array when no categories exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await CategoriasRepository.findAll();
    expect(result).toEqual([]);
  });
});

describe('CategoriasRepository.findById', () => {
  it('returns the category when found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [sampleCategoria] });
    const result = await CategoriasRepository.findById(1);
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(result).toEqual(sampleCategoria);
  });

  it('returns null when not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await CategoriasRepository.findById(999);
    expect(result).toBeNull();
  });
});

describe('CategoriasRepository.create', () => {
  it('inserts a new category and returns it', async () => {
    pool.query.mockResolvedValueOnce({ rows: [sampleCategoria] });
    const result = await CategoriasRepository.create({
      nombre: 'Ventas',
      descripcion: 'Métricas de ventas',
      color_hex: '#FF0000',
    });
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO categorias_metricas'),
      ['Ventas', 'Métricas de ventas', '#FF0000']
    );
    expect(result).toEqual(sampleCategoria);
  });

  it('passes null for optional fields when omitted', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2, nombre: 'RR.HH.', descripcion: null, color_hex: null }] });
    await CategoriasRepository.create({ nombre: 'RR.HH.' });
    const [, params] = pool.query.mock.calls[0];
    expect(params[1]).toBeNull(); // descripcion
    expect(params[2]).toBeNull(); // color_hex
  });
});

describe('CategoriasRepository.update', () => {
  it('updates a category and returns the updated row', async () => {
    const updated = { ...sampleCategoria, nombre: 'Marketing' };
    pool.query.mockResolvedValueOnce({ rows: [updated] });
    const result = await CategoriasRepository.update(1, { nombre: 'Marketing' });
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE categorias_metricas'),
      expect.arrayContaining([1])
    );
    expect(result).toEqual(updated);
  });

  it('returns null when the category does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await CategoriasRepository.update(999, { nombre: 'X' });
    expect(result).toBeNull();
  });
});

describe('CategoriasRepository.deleteById', () => {
  it('deletes a category and returns the deleted row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [sampleCategoria] });
    const result = await CategoriasRepository.deleteById(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM categorias_metricas'),
      [1]
    );
    expect(result).toEqual(sampleCategoria);
  });

  it('returns null when the category does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await CategoriasRepository.deleteById(999);
    expect(result).toBeNull();
  });
});

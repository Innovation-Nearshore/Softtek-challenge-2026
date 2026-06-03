'use strict';

jest.mock('../../repositories/categoriasRepository');

const CategoriasRepository = require('../../repositories/categoriasRepository');
const CategoriasService = require('../../services/categoriasService');

const sampleCategoria = { id: 1, nombre: 'Ventas', descripcion: 'Desc', color_hex: '#FF0000' };

beforeEach(() => jest.clearAllMocks());

describe('CategoriasService.getAll', () => {
  it('delegates to CategoriasRepository.findAll', async () => {
    CategoriasRepository.findAll.mockResolvedValueOnce([sampleCategoria]);
    const result = await CategoriasService.getAll();
    expect(CategoriasRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([sampleCategoria]);
  });
});

describe('CategoriasService.getById', () => {
  it('returns the category when found', async () => {
    CategoriasRepository.findById.mockResolvedValueOnce(sampleCategoria);
    const result = await CategoriasService.getById(1);
    expect(CategoriasRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(sampleCategoria);
  });

  it('throws 404 when category is not found', async () => {
    CategoriasRepository.findById.mockResolvedValueOnce(null);
    await expect(CategoriasService.getById(999)).rejects.toMatchObject({ status: 404 });
  });
});

describe('CategoriasService.create', () => {
  it('creates a category when nombre is provided', async () => {
    CategoriasRepository.create.mockResolvedValueOnce(sampleCategoria);
    const result = await CategoriasService.create({ nombre: 'Ventas', color_hex: '#FF0000' });
    expect(CategoriasRepository.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(sampleCategoria);
  });

  it('throws 400 when nombre is missing', async () => {
    await expect(CategoriasService.create({ nombre: '' })).rejects.toMatchObject({ status: 400 });
    expect(CategoriasRepository.create).not.toHaveBeenCalled();
  });

  it('throws 400 when nombre is whitespace only', async () => {
    await expect(CategoriasService.create({ nombre: '   ' })).rejects.toMatchObject({ status: 400 });
  });
});

describe('CategoriasService.update', () => {
  it('updates and returns the category', async () => {
    const updated = { ...sampleCategoria, nombre: 'Marketing' };
    CategoriasRepository.update.mockResolvedValueOnce(updated);
    const result = await CategoriasService.update(1, { nombre: 'Marketing' });
    expect(CategoriasRepository.update).toHaveBeenCalledWith(1, { nombre: 'Marketing' });
    expect(result).toEqual(updated);
  });

  it('throws 404 when the category to update is not found', async () => {
    CategoriasRepository.update.mockResolvedValueOnce(null);
    await expect(CategoriasService.update(999, { nombre: 'X' })).rejects.toMatchObject({ status: 404 });
  });
});

describe('CategoriasService.delete', () => {
  it('deletes and returns the category', async () => {
    CategoriasRepository.deleteById.mockResolvedValueOnce(sampleCategoria);
    const result = await CategoriasService.delete(1);
    expect(CategoriasRepository.deleteById).toHaveBeenCalledWith(1);
    expect(result).toEqual(sampleCategoria);
  });

  it('throws 404 when the category to delete is not found', async () => {
    CategoriasRepository.deleteById.mockResolvedValueOnce(null);
    await expect(CategoriasService.delete(999)).rejects.toMatchObject({ status: 404 });
  });
});

'use strict';

jest.mock('../../config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const pool = require('../../config/database');
const PeriodosRepository = require('../../repositories/periodosRepository');

const samplePeriodo = {
  id: 1,
  anio: 2024,
  mes: 6,
  nombre_mes: 'Junio',
  trimestre: 2,
  fecha_inicio: '2024-06-01',
  fecha_fin: '2024-06-30',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PeriodosRepository.findAll', () => {
  it('returns all periods ordered by anio and mes descending', async () => {
    pool.query.mockResolvedValueOnce({ rows: [samplePeriodo] });
    const result = await PeriodosRepository.findAll();
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY anio DESC, mes DESC')
    );
    expect(result).toEqual([samplePeriodo]);
  });

  it('returns empty array when no periods exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await PeriodosRepository.findAll();
    expect(result).toEqual([]);
  });
});

describe('PeriodosRepository.findById', () => {
  it('returns the period when found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [samplePeriodo] });
    const result = await PeriodosRepository.findById(1);
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(result).toEqual(samplePeriodo);
  });

  it('returns null when not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await PeriodosRepository.findById(999);
    expect(result).toBeNull();
  });
});

describe('PeriodosRepository.findByAnioMes', () => {
  it('returns the period when found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [samplePeriodo] });
    const result = await PeriodosRepository.findByAnioMes(2024, 6);
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), [2024, 6]);
    expect(result).toEqual(samplePeriodo);
  });

  it('returns null when not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await PeriodosRepository.findByAnioMes(1900, 1);
    expect(result).toBeNull();
  });
});

describe('PeriodosRepository.create', () => {
  it('inserts a new period and returns it', async () => {
    pool.query.mockResolvedValueOnce({ rows: [samplePeriodo] });
    const result = await PeriodosRepository.create(samplePeriodo);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO periodos'),
      [2024, 6, 'Junio', 2, '2024-06-01', '2024-06-30']
    );
    expect(result).toEqual(samplePeriodo);
  });
});

describe('PeriodosRepository.upsert', () => {
  it('upserts a period and returns the row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [samplePeriodo] });
    const result = await PeriodosRepository.upsert(samplePeriodo);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT (anio, mes)'),
      [2024, 6, 'Junio', 2, '2024-06-01', '2024-06-30']
    );
    expect(result).toEqual(samplePeriodo);
  });
});

describe('PeriodosRepository.deleteById', () => {
  it('deletes a period and returns the deleted row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [samplePeriodo] });
    const result = await PeriodosRepository.deleteById(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM periodos'),
      [1]
    );
    expect(result).toEqual(samplePeriodo);
  });

  it('returns null when the period does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await PeriodosRepository.deleteById(999);
    expect(result).toBeNull();
  });
});

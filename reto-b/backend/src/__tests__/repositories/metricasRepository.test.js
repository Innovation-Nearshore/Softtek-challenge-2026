'use strict';

jest.mock('../../config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const pool = require('../../config/database');
const MetricasRepository = require('../../repositories/metricasRepository');

const sampleMetrica = {
  id: 1,
  periodo_id: 1,
  categoria_id: 1,
  nombre_metrica: 'Ingresos',
  valor_actual: 5000,
  valor_objetivo: 4500,
  unidad: 'USD',
  notas: null,
  anio: 2024,
  mes: 6,
  nombre_mes: 'Junio',
  trimestre: 2,
  fecha_inicio: '2024-06-01',
  fecha_fin: '2024-06-30',
  categoria_nombre: 'Ventas',
  categoria_color: '#FF0000',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MetricasRepository.findAll', () => {
  it('returns all metrics when no filters are provided', async () => {
    pool.query.mockResolvedValueOnce({ rows: [sampleMetrica] });
    const result = await MetricasRepository.findAll();
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), []);
    expect(result).toEqual([sampleMetrica]);
  });

  it('adds WHERE clause for periodo_id filter', async () => {
    pool.query.mockResolvedValueOnce({ rows: [sampleMetrica] });
    await MetricasRepository.findAll({ periodo_id: 1 });
    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain('mm.periodo_id');
    expect(params).toContain(1);
  });

  it('adds WHERE clause for categoria_id filter', async () => {
    pool.query.mockResolvedValueOnce({ rows: [sampleMetrica] });
    await MetricasRepository.findAll({ categoria_id: 1 });
    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain('mm.categoria_id');
    expect(params).toContain(1);
  });

  it('adds WHERE clause for anio filter', async () => {
    pool.query.mockResolvedValueOnce({ rows: [sampleMetrica] });
    await MetricasRepository.findAll({ anio: 2024 });
    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain('p.anio');
    expect(params).toContain(2024);
  });

  it('adds WHERE clause for trimestre filter', async () => {
    pool.query.mockResolvedValueOnce({ rows: [sampleMetrica] });
    await MetricasRepository.findAll({ trimestre: 2 });
    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain('p.trimestre');
    expect(params).toContain(2);
  });

  it('returns empty array when no metrics match', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await MetricasRepository.findAll({ periodo_id: 999 });
    expect(result).toEqual([]);
  });
});

describe('MetricasRepository.findById', () => {
  it('returns the metric when found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [sampleMetrica] });
    const result = await MetricasRepository.findById(1);
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(result).toEqual(sampleMetrica);
  });

  it('returns null when not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await MetricasRepository.findById(999);
    expect(result).toBeNull();
  });
});

describe('MetricasRepository.create', () => {
  it('inserts a new metric and returns it', async () => {
    pool.query.mockResolvedValueOnce({ rows: [sampleMetrica] });
    const result = await MetricasRepository.create({
      periodo_id: 1,
      categoria_id: 1,
      nombre_metrica: 'Ingresos',
      valor_actual: 5000,
      valor_objetivo: 4500,
      unidad: 'USD',
      notas: null,
    });
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO metricas_mensuales'),
      expect.arrayContaining([1, 1, 'Ingresos', 5000])
    );
    expect(result).toEqual(sampleMetrica);
  });

  it('passes null for optional fields when omitted', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ ...sampleMetrica, valor_objetivo: null, unidad: null, notas: null }] });
    await MetricasRepository.create({
      periodo_id: 1,
      categoria_id: 1,
      nombre_metrica: 'Test',
      valor_actual: 100,
    });
    const [, params] = pool.query.mock.calls[0];
    expect(params[4]).toBeNull(); // valor_objetivo
    expect(params[5]).toBeNull(); // unidad
    expect(params[6]).toBeNull(); // notas
  });
});

describe('MetricasRepository.update', () => {
  it('updates a metric and returns the updated row', async () => {
    const updated = { ...sampleMetrica, valor_actual: 9999 };
    pool.query.mockResolvedValueOnce({ rows: [updated] });
    const result = await MetricasRepository.update(1, { valor_actual: 9999 });
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE metricas_mensuales'),
      expect.arrayContaining([1])
    );
    expect(result).toEqual(updated);
  });

  it('returns null when the metric does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await MetricasRepository.update(999, { valor_actual: 1 });
    expect(result).toBeNull();
  });
});

describe('MetricasRepository.deleteById', () => {
  it('deletes a metric and returns the deleted row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [sampleMetrica] });
    const result = await MetricasRepository.deleteById(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM metricas_mensuales'),
      [1]
    );
    expect(result).toEqual(sampleMetrica);
  });

  it('returns null when the metric does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const result = await MetricasRepository.deleteById(999);
    expect(result).toBeNull();
  });
});

describe('MetricasRepository.bulkUpsert', () => {
  function makeClient() {
    return {
      query: jest.fn(),
      release: jest.fn(),
    };
  }

  it('inserts all records in a transaction and returns them', async () => {
    const client = makeClient();
    pool.connect.mockResolvedValueOnce(client);
    // BEGIN, row 1, COMMIT
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [sampleMetrica] }) // row insert
      .mockResolvedValueOnce({}); // COMMIT

    const records = [{
      periodo_id: 1,
      categoria_id: 1,
      nombre_metrica: 'Ingresos',
      valor_actual: 5000,
    }];
    const result = await MetricasRepository.bulkUpsert(records);
    expect(client.query).toHaveBeenCalledWith('BEGIN');
    expect(client.query).toHaveBeenCalledWith('COMMIT');
    expect(client.release).toHaveBeenCalled();
    expect(result).toEqual([sampleMetrica]);
  });

  it('rolls back and throws on error', async () => {
    const client = makeClient();
    pool.connect.mockResolvedValueOnce(client);
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error('DB error')); // row insert fails

    await expect(MetricasRepository.bulkUpsert([{
      periodo_id: 1,
      categoria_id: 1,
      nombre_metrica: 'X',
      valor_actual: 1,
    }])).rejects.toThrow('DB error');

    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalled();
  });
});

describe('MetricasRepository.getSummaryByCategoria', () => {
  it('returns summary rows without filters', async () => {
    const summaryRow = { categoria_id: 1, categoria: 'Ventas', total_metricas: '5' };
    pool.query.mockResolvedValueOnce({ rows: [summaryRow] });
    const result = await MetricasRepository.getSummaryByCategoria();
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), []);
    expect(result).toEqual([summaryRow]);
  });

  it('adds filter for periodo_id', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await MetricasRepository.getSummaryByCategoria({ periodo_id: 2 });
    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain('mm.periodo_id');
    expect(params).toContain(2);
  });

  it('adds filter for anio', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await MetricasRepository.getSummaryByCategoria({ anio: 2024 });
    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain('p.anio');
    expect(params).toContain(2024);
  });

  it('adds filter for trimestre', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await MetricasRepository.getSummaryByCategoria({ trimestre: 1 });
    const [query, params] = pool.query.mock.calls[0];
    expect(query).toContain('p.trimestre');
    expect(params).toContain(1);
  });
});

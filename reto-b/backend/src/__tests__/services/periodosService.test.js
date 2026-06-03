'use strict';

jest.mock('../../repositories/periodosRepository');

const PeriodosRepository = require('../../repositories/periodosRepository');
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

describe('PeriodosService.getAll', () => {
  it('delegates to PeriodosRepository.findAll', async () => {
    PeriodosRepository.findAll.mockResolvedValueOnce([samplePeriodo]);
    const result = await PeriodosService.getAll();
    expect(PeriodosRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([samplePeriodo]);
  });
});

describe('PeriodosService.getById', () => {
  it('returns the period when found', async () => {
    PeriodosRepository.findById.mockResolvedValueOnce(samplePeriodo);
    const result = await PeriodosService.getById(1);
    expect(PeriodosRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(samplePeriodo);
  });

  it('throws 404 when period is not found', async () => {
    PeriodosRepository.findById.mockResolvedValueOnce(null);
    await expect(PeriodosService.getById(999)).rejects.toMatchObject({ status: 404 });
  });
});

describe('PeriodosService.upsert', () => {
  it('upserts and returns the period when anio and mes are valid', async () => {
    PeriodosRepository.upsert.mockResolvedValueOnce(samplePeriodo);
    const result = await PeriodosService.upsert(samplePeriodo);
    expect(PeriodosRepository.upsert).toHaveBeenCalledWith(samplePeriodo);
    expect(result).toEqual(samplePeriodo);
  });

  it('throws 400 when anio is missing', async () => {
    const data = { mes: 6, nombre_mes: 'Junio', trimestre: 2, fecha_inicio: '2024-06-01', fecha_fin: '2024-06-30' };
    await expect(PeriodosService.upsert(data)).rejects.toMatchObject({ status: 400 });
    expect(PeriodosRepository.upsert).not.toHaveBeenCalled();
  });

  it('throws 400 when mes is missing', async () => {
    const data = { anio: 2024, nombre_mes: 'Junio', trimestre: 2, fecha_inicio: '2024-06-01', fecha_fin: '2024-06-30' };
    await expect(PeriodosService.upsert(data)).rejects.toMatchObject({ status: 400 });
    expect(PeriodosRepository.upsert).not.toHaveBeenCalled();
  });

  it('throws 400 when both anio and mes are missing', async () => {
    await expect(PeriodosService.upsert({})).rejects.toMatchObject({ status: 400 });
  });
});

describe('PeriodosService.delete', () => {
  it('deletes and returns the period', async () => {
    PeriodosRepository.deleteById.mockResolvedValueOnce(samplePeriodo);
    const result = await PeriodosService.delete(1);
    expect(PeriodosRepository.deleteById).toHaveBeenCalledWith(1);
    expect(result).toEqual(samplePeriodo);
  });

  it('throws 404 when the period to delete is not found', async () => {
    PeriodosRepository.deleteById.mockResolvedValueOnce(null);
    await expect(PeriodosService.delete(999)).rejects.toMatchObject({ status: 404 });
  });
});

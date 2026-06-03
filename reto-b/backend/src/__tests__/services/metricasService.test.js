'use strict';

jest.mock('../../repositories/metricasRepository');
jest.mock('../../repositories/periodosRepository');
jest.mock('../../repositories/categoriasRepository');
jest.mock('../../utils/csvValidator');
jest.mock('../../utils/dateUtils');

const MetricasRepository  = require('../../repositories/metricasRepository');
const PeriodosRepository  = require('../../repositories/periodosRepository');
const CategoriasRepository = require('../../repositories/categoriasRepository');
const { validateAllRows }  = require('../../utils/csvValidator');
const { buildPeriodoFromAnioMes } = require('../../utils/dateUtils');
const MetricasService     = require('../../services/metricasService');

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

const samplePeriodo   = { id: 1, anio: 2024, mes: 6, nombre_mes: 'Junio', trimestre: 2, fecha_inicio: '2024-06-01', fecha_fin: '2024-06-30' };
const sampleCategoria = { id: 1, nombre: 'Ventas', descripcion: '', color_hex: '#F00' };

beforeEach(() => jest.clearAllMocks());

// ── getAll ──────────────────────────────────────────────────────────────────
describe('MetricasService.getAll', () => {
  it('delegates to MetricasRepository.findAll with provided filters', async () => {
    MetricasRepository.findAll.mockResolvedValueOnce([sampleMetrica]);
    const filters = { periodo_id: 1 };
    const result = await MetricasService.getAll(filters);
    expect(MetricasRepository.findAll).toHaveBeenCalledWith(filters);
    expect(result).toEqual([sampleMetrica]);
  });
});

// ── getById ─────────────────────────────────────────────────────────────────
describe('MetricasService.getById', () => {
  it('returns the metric when found', async () => {
    MetricasRepository.findById.mockResolvedValueOnce(sampleMetrica);
    const result = await MetricasService.getById(1);
    expect(result).toEqual(sampleMetrica);
  });

  it('throws 404 when metric is not found', async () => {
    MetricasRepository.findById.mockResolvedValueOnce(null);
    await expect(MetricasService.getById(999)).rejects.toMatchObject({ status: 404 });
  });
});

// ── create ──────────────────────────────────────────────────────────────────
describe('MetricasService.create', () => {
  it('creates a metric when all required fields are present and FKs exist', async () => {
    PeriodosRepository.findById.mockResolvedValueOnce(samplePeriodo);
    CategoriasRepository.findById.mockResolvedValueOnce(sampleCategoria);
    MetricasRepository.create.mockResolvedValueOnce(sampleMetrica);

    const result = await MetricasService.create(sampleMetrica);
    expect(PeriodosRepository.findById).toHaveBeenCalledWith(1);
    expect(CategoriasRepository.findById).toHaveBeenCalledWith(1);
    expect(MetricasRepository.create).toHaveBeenCalledWith(sampleMetrica);
    expect(result).toEqual(sampleMetrica);
  });

  it('throws 400 when periodo_id is missing', async () => {
    const data = { ...sampleMetrica, periodo_id: undefined };
    await expect(MetricasService.create(data)).rejects.toMatchObject({ status: 400 });
    expect(MetricasRepository.create).not.toHaveBeenCalled();
  });

  it('throws 400 when categoria_id is missing', async () => {
    const data = { ...sampleMetrica, categoria_id: undefined };
    await expect(MetricasService.create(data)).rejects.toMatchObject({ status: 400 });
  });

  it('throws 400 when nombre_metrica is missing', async () => {
    const data = { ...sampleMetrica, nombre_metrica: undefined };
    await expect(MetricasService.create(data)).rejects.toMatchObject({ status: 400 });
  });

  it('throws 400 when valor_actual is null', async () => {
    const data = { ...sampleMetrica, valor_actual: null };
    await expect(MetricasService.create(data)).rejects.toMatchObject({ status: 400 });
  });

  it('throws 400 when periodo_id does not exist', async () => {
    PeriodosRepository.findById.mockResolvedValueOnce(null);
    await expect(MetricasService.create(sampleMetrica)).rejects.toMatchObject({ status: 400 });
    expect(MetricasRepository.create).not.toHaveBeenCalled();
  });

  it('throws 400 when categoria_id does not exist', async () => {
    PeriodosRepository.findById.mockResolvedValueOnce(samplePeriodo);
    CategoriasRepository.findById.mockResolvedValueOnce(null);
    await expect(MetricasService.create(sampleMetrica)).rejects.toMatchObject({ status: 400 });
    expect(MetricasRepository.create).not.toHaveBeenCalled();
  });
});

// ── update ──────────────────────────────────────────────────────────────────
describe('MetricasService.update', () => {
  it('updates and returns the metric when found', async () => {
    const updated = { ...sampleMetrica, valor_actual: 9999 };
    MetricasRepository.findById.mockResolvedValueOnce(sampleMetrica);
    MetricasRepository.update.mockResolvedValueOnce(updated);

    const result = await MetricasService.update(1, { valor_actual: 9999 });
    expect(MetricasRepository.findById).toHaveBeenCalledWith(1);
    expect(MetricasRepository.update).toHaveBeenCalledWith(1, { valor_actual: 9999 });
    expect(result).toEqual(updated);
  });

  it('throws 404 when the metric is not found', async () => {
    MetricasRepository.findById.mockResolvedValueOnce(null);
    await expect(MetricasService.update(999, {})).rejects.toMatchObject({ status: 404 });
    expect(MetricasRepository.update).not.toHaveBeenCalled();
  });
});

// ── delete ──────────────────────────────────────────────────────────────────
describe('MetricasService.delete', () => {
  it('deletes and returns the metric', async () => {
    MetricasRepository.deleteById.mockResolvedValueOnce(sampleMetrica);
    const result = await MetricasService.delete(1);
    expect(MetricasRepository.deleteById).toHaveBeenCalledWith(1);
    expect(result).toEqual(sampleMetrica);
  });

  it('throws 404 when the metric to delete is not found', async () => {
    MetricasRepository.deleteById.mockResolvedValueOnce(null);
    await expect(MetricasService.delete(999)).rejects.toMatchObject({ status: 404 });
  });
});

// ── getSummary ───────────────────────────────────────────────────────────────
describe('MetricasService.getSummary', () => {
  it('delegates to MetricasRepository.getSummaryByCategoria', async () => {
    const summary = [{ categoria: 'Ventas', total_metricas: '5' }];
    MetricasRepository.getSummaryByCategoria.mockResolvedValueOnce(summary);
    const filters = { anio: 2024 };
    const result = await MetricasService.getSummary(filters);
    expect(MetricasRepository.getSummaryByCategoria).toHaveBeenCalledWith(filters);
    expect(result).toEqual(summary);
  });
});

// ── processCsv ───────────────────────────────────────────────────────────────
describe('MetricasService.processCsv', () => {
  const fs   = require('fs');
  const path = require('path');
  const os   = require('os');

  function writeTempCsv(content) {
    const filePath = path.join(os.tmpdir(), `test-${Date.now()}.csv`);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  it('processes a valid CSV file and returns inserted count', async () => {
    const csvContent = 'anio,mes,categoria_nombre,nombre_metrica,valor_actual\n2024,6,Ventas,Ingresos,5000\n';
    const filePath = writeTempCsv(csvContent);

    validateAllRows.mockReturnValueOnce({ valid: true, errors: [] });
    PeriodosRepository.findByAnioMes.mockResolvedValueOnce(samplePeriodo);
    CategoriasRepository.findAll.mockResolvedValueOnce([sampleCategoria]);
    MetricasRepository.bulkUpsert.mockResolvedValueOnce([sampleMetrica]);

    const result = await MetricasService.processCsv(filePath);
    expect(result.inserted).toBe(1);
    expect(result.records).toEqual([sampleMetrica]);
    // File should be cleaned up
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('throws 422 when CSV has validation errors', async () => {
    const csvContent = 'anio,mes,categoria_nombre,nombre_metrica,valor_actual\nbad,0,,, \n';
    const filePath = writeTempCsv(csvContent);

    validateAllRows.mockReturnValueOnce({ valid: false, errors: ['Fila 2: anio inválido'] });

    await expect(MetricasService.processCsv(filePath)).rejects.toMatchObject({ status: 422 });
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('creates a new period when period does not exist', async () => {
    const csvContent = 'anio,mes,categoria_nombre,nombre_metrica,valor_actual\n2025,1,Ventas,Test,100\n';
    const filePath = writeTempCsv(csvContent);

    const newPeriodo = { id: 99, anio: 2025, mes: 1, nombre_mes: 'Enero', trimestre: 1, fecha_inicio: '2025-01-01', fecha_fin: '2025-01-31' };
    validateAllRows.mockReturnValueOnce({ valid: true, errors: [] });
    PeriodosRepository.findByAnioMes.mockResolvedValueOnce(null); // not found
    buildPeriodoFromAnioMes.mockReturnValueOnce(newPeriodo);
    PeriodosRepository.create.mockResolvedValueOnce(newPeriodo);
    CategoriasRepository.findAll.mockResolvedValueOnce([sampleCategoria]);
    MetricasRepository.bulkUpsert.mockResolvedValueOnce([{ ...sampleMetrica, periodo_id: 99 }]);

    const result = await MetricasService.processCsv(filePath);
    expect(PeriodosRepository.create).toHaveBeenCalledWith(newPeriodo);
    expect(result.inserted).toBe(1);
  });

  it('throws 422 when category is not found in DB', async () => {
    const csvContent = 'anio,mes,categoria_nombre,nombre_metrica,valor_actual\n2024,6,Inexistente,Test,100\n';
    const filePath = writeTempCsv(csvContent);

    validateAllRows.mockReturnValueOnce({ valid: true, errors: [] });
    PeriodosRepository.findByAnioMes.mockResolvedValueOnce(samplePeriodo);
    CategoriasRepository.findAll.mockResolvedValueOnce([]); // empty — categoria not found

    await expect(MetricasService.processCsv(filePath)).rejects.toMatchObject({ status: 422 });
    expect(fs.existsSync(filePath)).toBe(false);
  });
});

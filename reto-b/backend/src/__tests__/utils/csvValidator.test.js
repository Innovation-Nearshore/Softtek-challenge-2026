'use strict';

const { validateMetricaRow, validateAllRows } = require('../../utils/csvValidator');

const validRow = {
  anio: '2024',
  mes: '6',
  categoria_nombre: 'Ventas',
  nombre_metrica: 'Ingresos',
  valor_actual: '1000',
};

describe('validateMetricaRow', () => {
  it('returns no errors for a valid row', () => {
    expect(validateMetricaRow(validRow, 2)).toHaveLength(0);
  });

  it('returns error for missing anio', () => {
    const errors = validateMetricaRow({ ...validRow, anio: '' }, 2);
    expect(errors.some((e) => e.includes('anio'))).toBe(true);
  });

  it('returns error for anio below 2000', () => {
    const errors = validateMetricaRow({ ...validRow, anio: '1999' }, 2);
    expect(errors.some((e) => e.includes('anio'))).toBe(true);
  });

  it('returns error for anio above 2100', () => {
    const errors = validateMetricaRow({ ...validRow, anio: '2101' }, 2);
    expect(errors.some((e) => e.includes('anio'))).toBe(true);
  });

  it('returns error for non-numeric anio', () => {
    const errors = validateMetricaRow({ ...validRow, anio: 'abc' }, 2);
    expect(errors.some((e) => e.includes('anio'))).toBe(true);
  });

  it('returns error for mes = 0', () => {
    const errors = validateMetricaRow({ ...validRow, mes: '0' }, 2);
    expect(errors.some((e) => e.includes('mes'))).toBe(true);
  });

  it('returns error for mes = 13', () => {
    const errors = validateMetricaRow({ ...validRow, mes: '13' }, 2);
    expect(errors.some((e) => e.includes('mes'))).toBe(true);
  });

  it('returns error for missing mes', () => {
    const errors = validateMetricaRow({ ...validRow, mes: '' }, 2);
    expect(errors.some((e) => e.includes('mes'))).toBe(true);
  });

  it('returns error for blank categoria_nombre', () => {
    const errors = validateMetricaRow({ ...validRow, categoria_nombre: '   ' }, 2);
    expect(errors.some((e) => e.includes('categoria_nombre'))).toBe(true);
  });

  it('returns error for missing categoria_nombre', () => {
    const errors = validateMetricaRow({ ...validRow, categoria_nombre: '' }, 2);
    expect(errors.some((e) => e.includes('categoria_nombre'))).toBe(true);
  });

  it('returns error for blank nombre_metrica', () => {
    const errors = validateMetricaRow({ ...validRow, nombre_metrica: '  ' }, 2);
    expect(errors.some((e) => e.includes('nombre_metrica'))).toBe(true);
  });

  it('returns error for non-numeric valor_actual', () => {
    const errors = validateMetricaRow({ ...validRow, valor_actual: 'abc' }, 2);
    expect(errors.some((e) => e.includes('valor_actual'))).toBe(true);
  });

  it('returns error for empty valor_actual', () => {
    const errors = validateMetricaRow({ ...validRow, valor_actual: '' }, 2);
    expect(errors.some((e) => e.includes('valor_actual'))).toBe(true);
  });

  it('accepts valor_actual = 0', () => {
    const errors = validateMetricaRow({ ...validRow, valor_actual: '0' }, 2);
    expect(errors).toHaveLength(0);
  });

  it('includes row index in the error message', () => {
    const errors = validateMetricaRow({ ...validRow, anio: '' }, 5);
    expect(errors[0]).toContain('5');
  });
});

describe('validateAllRows', () => {
  it('returns valid=false and error for empty array', () => {
    const result = validateAllRows([]);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('El archivo CSV está vacío');
  });

  it('returns valid=false for null input', () => {
    const result = validateAllRows(null);
    expect(result.valid).toBe(false);
  });

  it('returns valid=true when all rows pass', () => {
    const result = validateAllRows([validRow, { ...validRow, nombre_metrica: 'Ventas2' }]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid=false and aggregates errors from multiple rows', () => {
    const row1 = { ...validRow, anio: 'bad' };
    const row2 = { ...validRow, mes: '0' };
    const result = validateAllRows([row1, row2]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

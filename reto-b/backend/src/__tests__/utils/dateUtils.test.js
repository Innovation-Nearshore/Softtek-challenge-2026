'use strict';

const {
  getTrimestre,
  getFechaInicio,
  getFechaFin,
  getNombreMes,
  buildPeriodoFromAnioMes,
  NOMBRE_MESES,
} = require('../../utils/dateUtils');

describe('getTrimestre', () => {
  test.each([
    [1, 1], [2, 1], [3, 1],
    [4, 2], [5, 2], [6, 2],
    [7, 3], [8, 3], [9, 3],
    [10, 4], [11, 4], [12, 4],
  ])('month %i → quarter %i', (mes, expected) => {
    expect(getTrimestre(mes)).toBe(expected);
  });
});

describe('getFechaInicio', () => {
  it('returns the first day of the month formatted as YYYY-MM-DD', () => {
    expect(getFechaInicio(2024, 1)).toBe('2024-01-01');
    expect(getFechaInicio(2024, 12)).toBe('2024-12-01');
    expect(getFechaInicio(2024, 6)).toBe('2024-06-01');
  });
});

describe('getFechaFin', () => {
  it('returns the last day of the month for standard months', () => {
    expect(getFechaFin(2024, 1)).toBe('2024-01-31');
    expect(getFechaFin(2024, 4)).toBe('2024-04-30');
    expect(getFechaFin(2024, 12)).toBe('2024-12-31');
  });

  it('handles leap year February', () => {
    expect(getFechaFin(2024, 2)).toBe('2024-02-29');
  });

  it('handles non-leap year February', () => {
    expect(getFechaFin(2023, 2)).toBe('2023-02-28');
  });
});

describe('getNombreMes', () => {
  test.each([
    [1, 'Enero'], [2, 'Febrero'], [3, 'Marzo'],
    [4, 'Abril'], [5, 'Mayo'], [6, 'Junio'],
    [7, 'Julio'], [8, 'Agosto'], [9, 'Septiembre'],
    [10, 'Octubre'], [11, 'Noviembre'], [12, 'Diciembre'],
  ])('month %i → "%s"', (mes, expected) => {
    expect(getNombreMes(mes)).toBe(expected);
  });

  it('returns empty string for invalid month', () => {
    expect(getNombreMes(0)).toBe('');
    expect(getNombreMes(13)).toBe('');
  });
});

describe('buildPeriodoFromAnioMes', () => {
  it('builds a complete period object for January 2024', () => {
    const result = buildPeriodoFromAnioMes(2024, 1);
    expect(result).toEqual({
      anio: 2024,
      mes: 1,
      nombre_mes: 'Enero',
      trimestre: 1,
      fecha_inicio: '2024-01-01',
      fecha_fin: '2024-01-31',
    });
  });

  it('builds a complete period object for June 2025', () => {
    const result = buildPeriodoFromAnioMes(2025, 6);
    expect(result).toEqual({
      anio: 2025,
      mes: 6,
      nombre_mes: 'Junio',
      trimestre: 2,
      fecha_inicio: '2025-06-01',
      fecha_fin: '2025-06-30',
    });
  });

  it('builds a correct period object for December 2023', () => {
    const result = buildPeriodoFromAnioMes(2023, 12);
    expect(result).toEqual({
      anio: 2023,
      mes: 12,
      nombre_mes: 'Diciembre',
      trimestre: 4,
      fecha_inicio: '2023-12-01',
      fecha_fin: '2023-12-31',
    });
  });
});

describe('NOMBRE_MESES', () => {
  it('has 13 entries (index 0 empty, 1-12 are month names)', () => {
    expect(NOMBRE_MESES).toHaveLength(13);
    expect(NOMBRE_MESES[0]).toBe('');
    expect(NOMBRE_MESES[1]).toBe('Enero');
    expect(NOMBRE_MESES[12]).toBe('Diciembre');
  });
});

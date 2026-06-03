'use strict';

/**
 * CSV validation utility (SRP: only validates CSV row data).
 * Keeps validation rules isolated from file I/O and business logic.
 */

/**
 * Validates a single CSV row. Returns an array of error strings.
 * @param {Object} row  - Raw parsed CSV row object
 * @param {number} index - Human-readable row number (for error messages)
 * @returns {string[]}
 */
function validateMetricaRow(row, index) {
  const errors = [];
  const anio = parseInt(row.anio, 10);
  const mes = parseInt(row.mes, 10);

  if (!row.anio || isNaN(anio) || anio < 2000 || anio > 2100) {
    errors.push(`Fila ${index}: anio inválido (${row.anio})`);
  }
  if (!row.mes || isNaN(mes) || mes < 1 || mes > 12) {
    errors.push(`Fila ${index}: mes inválido (${row.mes})`);
  }
  if (!row.categoria_nombre || row.categoria_nombre.trim() === '') {
    errors.push(`Fila ${index}: categoria_nombre es requerido`);
  }
  if (!row.nombre_metrica || row.nombre_metrica.trim() === '') {
    errors.push(`Fila ${index}: nombre_metrica es requerido`);
  }
  if (
    row.valor_actual === undefined ||
    row.valor_actual === '' ||
    isNaN(parseFloat(row.valor_actual))
  ) {
    errors.push(`Fila ${index}: valor_actual inválido (${row.valor_actual})`);
  }

  return errors;
}

/**
 * Validates all rows in a CSV dataset.
 * @param {Object[]} rows
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateAllRows(rows) {
  if (!rows || rows.length === 0) {
    return { valid: false, errors: ['El archivo CSV está vacío'] };
  }

  const errors = [];
  rows.forEach((row, idx) => {
    const rowErrors = validateMetricaRow(row, idx + 2); // +2: header is row 1
    errors.push(...rowErrors);
  });

  return { valid: errors.length === 0, errors };
}

module.exports = { validateMetricaRow, validateAllRows };

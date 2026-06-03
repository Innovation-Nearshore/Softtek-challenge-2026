'use strict';

/**
 * Pure date/calendar helper functions.
 * Single Responsibility: date calculations only — no I/O, no DB, no HTTP.
 */

const NOMBRE_MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Returns the quarter (1–4) for a given month (1–12).
 * @param {number} mes
 * @returns {number}
 */
function getTrimestre(mes) {
  if (mes >= 1 && mes <= 3) return 1;
  if (mes >= 4 && mes <= 6) return 2;
  if (mes >= 7 && mes <= 9) return 3;
  return 4;
}

/**
 * Returns the first day of a month as an ISO date string (YYYY-MM-DD).
 * @param {number} anio
 * @param {number} mes
 * @returns {string}
 */
function getFechaInicio(anio, mes) {
  return `${anio}-${String(mes).padStart(2, '0')}-01`;
}

/**
 * Returns the last day of a month as an ISO date string (YYYY-MM-DD).
 * @param {number} anio
 * @param {number} mes
 * @returns {string}
 */
function getFechaFin(anio, mes) {
  const lastDay = new Date(anio, mes, 0).getDate();
  return `${anio}-${String(mes).padStart(2, '0')}-${lastDay}`;
}

/**
 * Returns the Spanish name for a month number (1–12).
 * @param {number} mes
 * @returns {string}
 */
function getNombreMes(mes) {
  return NOMBRE_MESES[mes] || '';
}

module.exports = { getTrimestre, getFechaInicio, getFechaFin, getNombreMes, NOMBRE_MESES };


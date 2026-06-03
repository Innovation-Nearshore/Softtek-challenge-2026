'use strict';

/**
 * Date utility module (SRP: only handles date/month calculations).
 */

const NOMBRE_MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Returns the quarter number (1–4) for a given month (1–12).
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
 * Returns the first day of the month formatted as YYYY-MM-DD.
 * @param {number} anio
 * @param {number} mes
 * @returns {string}
 */
function getFechaInicio(anio, mes) {
  return `${anio}-${String(mes).padStart(2, '0')}-01`;
}

/**
 * Returns the last day of the month formatted as YYYY-MM-DD.
 * @param {number} anio
 * @param {number} mes
 * @returns {string}
 */
function getFechaFin(anio, mes) {
  const lastDay = new Date(anio, mes, 0).getDate();
  return `${anio}-${String(mes).padStart(2, '0')}-${lastDay}`;
}

/**
 * Returns the Spanish month name for a given month number (1–12).
 * @param {number} mes
 * @returns {string}
 */
function getNombreMes(mes) {
  return NOMBRE_MESES[mes] || '';
}

/**
 * Builds a full periodo object from anio + mes.
 * @param {number} anio
 * @param {number} mes
 * @returns {{ anio, mes, nombre_mes, trimestre, fecha_inicio, fecha_fin }}
 */
function buildPeriodoFromAnioMes(anio, mes) {
  return {
    anio,
    mes,
    nombre_mes: getNombreMes(mes),
    trimestre: getTrimestre(mes),
    fecha_inicio: getFechaInicio(anio, mes),
    fecha_fin: getFechaFin(anio, mes),
  };
}

module.exports = {
  getTrimestre,
  getFechaInicio,
  getFechaFin,
  getNombreMes,
  buildPeriodoFromAnioMes,
  NOMBRE_MESES,
};

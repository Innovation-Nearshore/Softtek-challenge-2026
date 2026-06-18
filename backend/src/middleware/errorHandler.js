'use strict';

const AppError = require('../utils/AppError');

/**
 * Global Express error handler.
 * Must be registered last in app.js (after all routes).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // PostgreSQL unique-violation (e.g. duplicate numero_ticket)
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con esos datos únicos.',
    });
  }

  // PostgreSQL foreign-key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referencia inválida: uno de los IDs proporcionados no existe.',
    });
  }

  // PostgreSQL check-constraint violation
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'El valor proporcionado no cumple con las restricciones de la base de datos.',
    });
  }

  // Unexpected errors — log and return generic 500
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor. Por favor intente nuevamente.',
  });
}

module.exports = errorHandler;

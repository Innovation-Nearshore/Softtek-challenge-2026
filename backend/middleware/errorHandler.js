'use strict';

/**
 * Global error-handling middleware (SRP: only handles error responses).
 * Must be registered LAST in Express so it catches errors from all routes.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[ErrorHandler]', err.message, err.stack);

  // PostgreSQL constraint violations
  if (err.code === '23514') {
    return res.status(422).json({
      success: false,
      message: 'Valor no permitido por las restricciones de la base de datos.',
      detail: err.detail || null,
    });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor.',
  });
};

/**
 * 404 handler — registered before errorHandler but after all routes.
 */
const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };

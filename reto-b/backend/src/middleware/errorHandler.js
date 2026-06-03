'use strict';

/**
 * Global error handler middleware (SRP: only formats and sends error responses).
 * Must be registered last in Express middleware chain.
 */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  console.error(`[ErrorHandler] ${status} - ${message}`, err.stack || '');

  const body = { success: false, message };
  if (err.errors) body.errors = err.errors;

  res.status(status).json(body);
}

module.exports = errorHandler;

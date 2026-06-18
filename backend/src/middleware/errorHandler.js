/**
 * Global error handling middleware.
 * Returns consistent JSON error responses.
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err.message || err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    success: false,
    error: message,
  });
}

module.exports = errorHandler;

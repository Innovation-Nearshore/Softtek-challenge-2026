import env from '../config/env.js';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;

  // Log full error on server (never expose stack to client)
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${status}: ${err.message}`);
  if (env.nodeEnv === 'development') {
    console.error(err.stack);
  }

  // OWASP A09: Do not expose internal error details in production
  const message =
    env.nodeEnv === 'production' && status === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
  });
};

export default errorHandler;

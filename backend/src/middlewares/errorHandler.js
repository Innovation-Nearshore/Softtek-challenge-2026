const PG_ERRORS = {
  '23503': { status: 400, message: 'Invalid reference: related record does not exist.' },
  '23502': { status: 400, message: 'A required field is missing.' },
  '23514': { status: 400, message: 'Invalid value provided for a constrained field.' },
  '23505': { status: 400, message: 'Duplicate value violates a unique constraint.' },
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const pgError = PG_ERRORS[err.code];
  if (pgError) {
    return res.status(pgError.status).json({ error: pgError.message });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;
  return res.status(status).json({ error: message });
};

module.exports = errorHandler;

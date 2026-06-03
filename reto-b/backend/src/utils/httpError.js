'use strict';

/**
 * HTTP error utility (SRP: only creates shaped error objects for the API layer).
 * Services throw these; controllers catch and forward them.
 */

/**
 * Creates a plain error object with an HTTP status code.
 * @param {number} status  - HTTP status code (e.g. 400, 404, 422)
 * @param {string} message - Human-readable message
 * @param {string[]} [errors] - Optional array of validation error strings
 * @returns {{ status: number, message: string, errors?: string[] }}
 */
function createHttpError(status, message, errors) {
  const err = new Error(message);
  err.status = status;
  if (errors) err.errors = errors;
  return err;
}

const HttpError = {
  badRequest: (message, errors) => createHttpError(400, message, errors),
  notFound: (message) => createHttpError(404, message),
  conflict: (message) => createHttpError(409, message),
  unprocessable: (message, errors) => createHttpError(422, message, errors),
  internal: (message) => createHttpError(500, message),
};

module.exports = { createHttpError, HttpError };

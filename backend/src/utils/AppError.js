'use strict';

/**
 * Custom error class that carries an HTTP status code.
 * Used throughout services and middleware to produce consistent API error responses.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} [statusCode=500] - HTTP status code to send in the response
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = AppError;

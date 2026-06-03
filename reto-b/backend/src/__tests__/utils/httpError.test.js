'use strict';

const { createHttpError, HttpError } = require('../../utils/httpError');

describe('createHttpError', () => {
  it('creates an Error with the given status and message', () => {
    const err = createHttpError(400, 'Bad request');
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(400);
    expect(err.message).toBe('Bad request');
  });

  it('attaches errors array when provided', () => {
    const err = createHttpError(422, 'Validation failed', ['field required']);
    expect(err.errors).toEqual(['field required']);
  });

  it('does not attach errors when not provided', () => {
    const err = createHttpError(404, 'Not found');
    expect(err.errors).toBeUndefined();
  });
});

describe('HttpError factory methods', () => {
  test('badRequest returns status 400', () => {
    const err = HttpError.badRequest('bad input');
    expect(err.status).toBe(400);
    expect(err.message).toBe('bad input');
  });

  test('badRequest accepts optional errors array', () => {
    const err = HttpError.badRequest('bad input', ['err1', 'err2']);
    expect(err.errors).toEqual(['err1', 'err2']);
  });

  test('notFound returns status 404', () => {
    const err = HttpError.notFound('not found');
    expect(err.status).toBe(404);
  });

  test('conflict returns status 409', () => {
    const err = HttpError.conflict('conflict');
    expect(err.status).toBe(409);
  });

  test('unprocessable returns status 422', () => {
    const err = HttpError.unprocessable('unprocessable', ['e1']);
    expect(err.status).toBe(422);
    expect(err.errors).toEqual(['e1']);
  });

  test('internal returns status 500', () => {
    const err = HttpError.internal('server error');
    expect(err.status).toBe(500);
  });
});

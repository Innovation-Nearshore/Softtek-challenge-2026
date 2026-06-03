'use strict';

const errorHandler = require('../../middleware/errorHandler');

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler middleware', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('responds with the error status and message', () => {
    const err = { status: 400, message: 'Bad request' };
    const res = makeRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Bad request' });
  });

  it('defaults to 500 when no status is set', () => {
    const err = new Error('Something went wrong');
    const res = makeRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Something went wrong' })
    );
  });

  it('defaults to generic message when error has no message', () => {
    const err = {};
    const res = makeRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error interno del servidor' })
    );
  });

  it('includes errors array in the response when present on the error', () => {
    const err = { status: 422, message: 'Validation failed', errors: ['field1 required'] };
    const res = makeRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed',
      errors: ['field1 required'],
    });
  });

  it('does not include errors key when not present on the error', () => {
    const err = { status: 404, message: 'Not found' };
    const res = makeRes();
    errorHandler(err, {}, res, jest.fn());
    const call = res.json.mock.calls[0][0];
    expect(call).not.toHaveProperty('errors');
  });

  it('logs to console.error', () => {
    const err = { status: 500, message: 'crash' };
    const res = makeRes();
    errorHandler(err, {}, res, jest.fn());
    expect(consoleSpy).toHaveBeenCalled();
  });
});

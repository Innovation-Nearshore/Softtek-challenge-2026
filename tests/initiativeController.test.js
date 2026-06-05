// Filename: initiativeController.test.js
// Instructions:
// - Ensure you have Jest installed: npm install --save-dev jest
// - To run the tests: npx jest initiativeController.test.js
// - Mock repository functions and Express req/res/next objects
// - The controller functions are imported from './initiativeController'
// - Place this file in the root or tests directory and adjust the import path if necessary

const { getAll, getById, create, update, patch, remove } = require('./initiativeController');
const repository = require('../models/InitiativeRepository');

// Mock the repository methods
jest.mock('../models/InitiativeRepository');

// Utility: Mock Express response object
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// Utility: Mock Express next function
const next = jest.fn();

// ----------------------- Happy Paths -----------------------

// getAll: Should return initiatives list
test('getAll returns initiatives with success true', async () => {
  // Document: Verifies successful retrieval of all initiatives.
  const res = mockRes();
  const req = { query: { estado: 'active' } };
  repository.findAll.mockResolvedValue([{ id: 1, name: 'Test' }]);
  await getAll(req, res, next);
  expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 1, name: 'Test' }] });
});

// getById: Should return initiative if found
test('getById returns initiative for valid id', async () => {
  // Document: Verifies successful retrieval of a specific initiative by valid ID.
  const res = mockRes();
  const req = { params: { id: '1' } };
  repository.findById.mockResolvedValue({ id: 1, name: 'Test' });
  await getById(req, res, next);
  expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 1, name: 'Test' } });
});

// create: Should create and return initiative
test('create returns 201 and created initiative', async () => {
  // Document: Verifies creation of initiative with valid data.
  const res = mockRes();
  const req = { body: { name: 'Test Initiative' } };
  repository.create.mockResolvedValue({ id: 2, name: 'Test Initiative' });
  await create(req, res, next);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 2, name: 'Test Initiative' } });
});

// update: Should update and return initiative
test('update returns updated initiative', async () => {
  // Document: Verifies update action succeeds for valid id and data.
  const res = mockRes();
  const req = { params: { id: '2' }, body: { name: 'New Name' } };
  repository.update.mockResolvedValue({ id: 2, name: 'New Name' });
  await update(req, res, next);
  expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 2, name: 'New Name' } });
});

// patch: Should patch and return initiative
test('patch returns partially updated initiative', async () => {
  // Document: Verifies partial update succeeds with valid input.
  const res = mockRes();
  const req = { params: { id: '3' }, body: { estado: 'closed' } };
  repository.partialUpdate.mockResolvedValue({ id: 3, estado: 'closed' });
  await patch(req, res, next);
  expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 3, estado: 'closed' } });
});

// remove: Should delete and return success message
test('remove returns success message on valid delete', async () => {
  // Document: Verifies successful deletion for valid initiative id.
  const res = mockRes();
  const req = { params: { id: '1' } };
  repository.delete.mockResolvedValue(true);
  await remove(req, res, next);
  expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Iniciativa eliminada correctamente.' });
});

// ----------------------- Edge Cases -----------------------

// getAll: Should call next on repository error
test('getAll calls next on error', async () => {
  // Document: Verifies error handling when repository throws.
  const res = mockRes();
  const req = { query: {} };
  const error = new Error('Database error');
  repository.findAll.mockRejectedValue(error);
  await getAll(req, res, next);
  expect(next).toHaveBeenCalledWith(error);
});

// getById: Non-existent initiative returns 404
test('getById returns 404 if initiative not found', async () => {
  // Document: Verifies 404 response for missing initiative.
  const res = mockRes();
  const req = { params: { id: '999' } };
  repository.findById.mockResolvedValue(null);
  await getById(req, res, next);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Iniciativa no encontrada.'
  });
});

// getById: Pass string as id, type error handling
test('getById handles string id', async () => {
  // Document: Verifies type conversion and error response for invalid id format.
  const res = mockRes();
  const req = { params: { id: 'abc' } };
  repository.findById.mockResolvedValue(null);
  await getById(req, res, next);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Iniciativa no encontrada.'
  });
});

// create: Should call next if repository fails
test('create calls next on error', async () => {
  // Document: Verifies error handling in creation.
  const res = mockRes();
  const req = { body: { name: 'Fail Initiative' } };
  const error = new Error('Create failed');
  repository.create.mockRejectedValue(error);
  await create(req, res, next);
  expect(next).toHaveBeenCalledWith(error);
});

// update: Non-existent id returns 404
test('update returns 404 for invalid id', async () => {
  // Document: Verifies 404 for attempt to update missing initiative.
  const res = mockRes();
  const req = { params: { id: '999' }, body: { name: 'Update' } };
  repository.update.mockResolvedValue(null);
  await update(req, res, next);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Iniciativa no encontrada.'
  });
});

// update: Pass zero and negative ids
test('update handles negative and zero ids', async () => {
  // Document: Verifies update response for zero and negative id.
  const res = mockRes();

  // Negative id
  const reqNeg = { params: { id: '-1' }, body: { name: 'Bad' } };
  repository.update.mockResolvedValue(null);
  await update(reqNeg, res, next);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Iniciativa no encontrada.'
  });

  // Zero id
  const reqZero = { params: { id: '0' }, body: { name: 'Zero' } };
  repository.update.mockResolvedValue(null);
  await update(reqZero, res, next);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Iniciativa no encontrada.'
  });
});

// patch: Should return 400 for empty body
test('patch returns 400 for empty body', async () => {
  // Document: Verifies proper error for empty patch request body.
  const res = mockRes();
  const req = { params: { id: '1' }, body: {} };
  await patch(req, res, next);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'El cuerpo de la solicitud no puede estar vacío.'
  });
});

// patch: Should return 404 for invalid id
test('patch returns 404 for invalid id', async () => {
  // Document: Verifies 404 for patch on non-existing initiative.
  const res = mockRes();
  const req = { params: { id: '999' }, body: { name: 'Patch' } };
  repository.partialUpdate.mockResolvedValue(null);
  await patch(req, res, next);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Iniciativa no encontrada.'
  });
});

// patch: Pass zero and negative ids
test('patch handles negative and zero ids', async () => {
  // Document: Verifies patch with invalid id values (edge).
  const res = mockRes();

  // Negative id
  const reqNeg = { params: { id: '-2' }, body: { estado: 'test' } };
  repository.partialUpdate.mockResolvedValue(null);
  await patch(reqNeg, res, next);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Iniciativa no encontrada.'
  });

  // Zero id
  const reqZero = { params: { id: '0' }, body: { estado: 'test' } };
  repository.partialUpdate.mockResolvedValue(null);
  await patch(reqZero, res, next);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Iniciativa no encontrada.'
  });
});

// remove: Non-existent initiative returns 404
test('remove returns 404 for invalid id', async () => {
  // Document: Verifies deletion response for missing initiative.
  const res = mockRes();
  const req = { params: { id: '999' } };
  repository.delete.mockResolvedValue(false);
  await remove(req, res, next);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Iniciativa no encontrada.'
  });
});

// remove: Pass zero and negative ids
test('remove handles negative and zero ids', async () => {
  // Document: Verifies delete with invalid id values (edge).
  const res = mockRes();

  // Negative id
  const reqNeg = { params: { id: '-2' } };
  repository.delete.mockResolvedValue(false);
  await remove(reqNeg, res, next);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Iniciativa no encontrada.'
  });

  // Zero id
  const reqZero = { params: { id: '0' } };
  repository.delete.mockResolvedValue(false);
  await remove(reqZero, res, next);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Iniciativa no encontrada.'
  });
});

// remove: Should call next if repository fails
test('remove calls next on error', async () => {
  // Document: Verifies error handling for delete.
  const res = mockRes();
  const req = { params: { id: '4' } };
  const error = new Error('Delete failed');
  repository.delete.mockRejectedValue(error);
  await remove(req, res, next);
  expect(next).toHaveBeenCalledWith(error);
});
import * as repo from '../repositories/initiativesRepository.js';

const VALID_STATUSES = ['Pendiente', 'En curso', 'Completado'];
const VALID_PRIORITIES = ['Alta', 'Media', 'Baja'];

export const getAllInitiatives = async ({ status, limit, offset } = {}) => {
  if (status && !VALID_STATUSES.includes(status)) {
    const err = new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    err.status = 400;
    throw err;
  }
  return repo.findAll({ status, limit, offset });
};

export const getInitiativeById = async (id) => {
  const initiative = await repo.findById(id);
  if (!initiative) {
    const err = new Error('Initiative not found');
    err.status = 404;
    throw err;
  }
  return initiative;
};

export const createInitiative = async (data) => {
  validateInitiativeData(data);
  return repo.create(data);
};

export const updateInitiative = async (id, data) => {
  validateInitiativeData(data);
  const updated = await repo.update(id, data);
  if (!updated) {
    const err = new Error('Initiative not found');
    err.status = 404;
    throw err;
  }
  return updated;
};

export const deleteInitiative = async (id) => {
  const deleted = await repo.remove(id);
  if (!deleted) {
    const err = new Error('Initiative not found');
    err.status = 404;
    throw err;
  }
  return deleted;
};

export const getPriorityStats = async () => {
  const counts = await repo.getPriorityCounts();
  const total = counts.reduce((sum, row) => sum + row.count, 0);

  const priorityStats = counts.map((row) => ({
    priority: row.priority,
    count: row.count,
    percentage: total > 0 ? Math.round((row.count / total) * 100) : 0,
  }));

  return { total, distribution: priorityStats };
};

export const getStats = async () => {
  const counts = await repo.getStatusCounts();
  // Map Spanish DB status values to English keys expected by the frontend
  const STATUS_KEY_MAP = {
    Pendiente: 'pending',
    'En curso': 'in_progress',
    Completado: 'completed',
  };

  const stats = {
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
  };

  for (const row of counts) {
    const key = STATUS_KEY_MAP[row.status];
    if (key) {
      stats[key] = row.count;
    }
    stats.total += row.count;
  }

  return stats;
};

const validateInitiativeData = (data) => {
  const { name, responsible, status, deadline, priority } = data;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    const err = new Error('Name is required');
    err.status = 400;
    throw err;
  }

  if (!responsible || typeof responsible !== 'string' || responsible.trim().length === 0) {
    const err = new Error('Responsible is required');
    err.status = 400;
    throw err;
  }

  if (!status || !VALID_STATUSES.includes(status)) {
    const err = new Error(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  if (!deadline) {
    const err = new Error('Deadline is required');
    err.status = 400;
    throw err;
  }

  if (!priority || !VALID_PRIORITIES.includes(priority)) {
    const err = new Error(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    err.status = 400;
    throw err;
  }
};

export default {
  getAllInitiatives,
  getInitiativeById,
  createInitiative,
  updateInitiative,
  deleteInitiative,
  getStats,
  getPriorityStats,
};

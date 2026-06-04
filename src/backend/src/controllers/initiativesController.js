import * as service from '../services/initiativesService.js';

export const getAll = async (req, res, next) => {
  try {
    const { status } = req.query;
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 200);
    const offset = parseInt(req.query.offset || '0', 10);
    const data = await service.getAllInitiatives({ status, limit, offset });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await service.getInitiativeById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = await service.createInitiative(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await service.updateInitiative(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await service.deleteInitiative(req.params.id);
    res.json({ success: true, message: 'Initiative deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const data = await service.getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getPriorityStats = async (req, res, next) => {
  try {
    const data = await service.getPriorityStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { getAll, getById, create, update, remove, getStats, getPriorityStats };

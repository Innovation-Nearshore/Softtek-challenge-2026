'use strict';

const repository = require('../models/InitiativeRepository');

/**
 * Initiatives controller — each method has a single responsibility (SRP).
 * Controllers depend on the repository abstraction, not concrete SQL (DIP).
 */

/** GET /api/initiatives[?estado=...] */
const getAll = async (req, res, next) => {
  try {
    const { estado } = req.query;
    const data = await repository.findAll({ estado });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/** GET /api/initiatives/:id */
const getById = async (req, res, next) => {
  try {
    const initiative = await repository.findById(Number(req.params.id));
    if (!initiative) {
      return res.status(404).json({ success: false, message: 'Iniciativa no encontrada.' });
    }
    res.json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
};

/** POST /api/initiatives */
const create = async (req, res, next) => {
  try {
    const initiative = await repository.create(req.body);
    res.status(201).json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/initiatives/:id */
const update = async (req, res, next) => {
  try {
    const initiative = await repository.update(Number(req.params.id), req.body);
    if (!initiative) {
      return res.status(404).json({ success: false, message: 'Iniciativa no encontrada.' });
    }
    res.json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/initiatives/:id — partial update (only provided fields) */
const patch = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: 'El cuerpo de la solicitud no puede estar vacío.' });
    }
    const initiative = await repository.partialUpdate(Number(req.params.id), req.body);
    if (!initiative) {
      return res.status(404).json({ success: false, message: 'Iniciativa no encontrada.' });
    }
    res.json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/initiatives/:id */
const remove = async (req, res, next) => {
  try {
    const deleted = await repository.delete(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Iniciativa no encontrada.' });
    }
    res.json({ success: true, message: 'Iniciativa eliminada correctamente.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, patch, remove };

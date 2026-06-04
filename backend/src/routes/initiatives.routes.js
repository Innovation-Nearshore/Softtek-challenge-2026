const { Router } = require('express');
const {
  getInitiatives,
  createInitiative,
  updateInitiativeEstado,
  updateInitiativeFields,
} = require('../controllers/initiatives.controller');

const router = Router();

// GET  /api/initiatives          — list all (with optional ?estado=&prioridad= filters)
router.get('/', getInitiatives);

// POST /api/initiatives          — create a new initiative
router.post('/', createInitiative);

// PATCH /api/initiatives/:id/estado — update only the estado field (Kanban D&D)
router.patch('/:id/estado', updateInitiativeEstado);

// PATCH /api/initiatives/:id     — inline field update (nombre, responsable, prioridad)
router.patch('/:id', updateInitiativeFields);

module.exports = router;

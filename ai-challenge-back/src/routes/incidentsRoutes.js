const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

// GET — Catálogo de categorías (literal antes de /:id para evitar conflictos)
router.get('/categories', incidentController.getCategories);

// GET — Todos los incidentes
router.get('/', incidentController.getAllIncidents);

// POST — Crear nuevo incidente
router.post('/', incidentController.createIncident);

// GET — Historial de cambios de un incidente
router.get('/:id/log', incidentController.getIncidentLog);

// PUT — Actualizar estado (con transacción y logging)
router.put('/:id/status', incidentController.updateIncidentStatus);

module.exports = router;

'use strict';

/**
 * Metricas routes (SRP: only route registration; delegates to MetricasController).
 */

const express = require('express');
const router = express.Router();
const MetricasController = require('../controllers/metricasController');
const upload = require('../middleware/uploadMiddleware');

// Static sub-routes first (must precede /:id)
router.get('/resumen',      MetricasController.getSummary);
router.post('/upload-csv',  upload.single('file'), MetricasController.uploadCsv);

// CRUD routes
router.get('/',     MetricasController.getAll);
router.get('/:id',  MetricasController.getById);
router.post('/',    MetricasController.create);
router.put('/:id',  MetricasController.update);
router.delete('/:id', MetricasController.delete);

module.exports = router;

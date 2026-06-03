'use strict';

/**
 * Reporte routes (SRP: only route registration; delegates to ReporteController).
 */

const express = require('express');
const router = express.Router();
const ReporteController = require('../controllers/reporteController');

router.get('/pdf', ReporteController.getPdf);

module.exports = router;

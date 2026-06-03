'use strict';

/**
 * Periodos routes (SRP: only route registration; delegates to PeriodosController).
 */

const express = require('express');
const router = express.Router();
const PeriodosController = require('../controllers/periodosController');

router.get('/',       PeriodosController.getAll);
router.get('/:id',    PeriodosController.getById);
router.post('/',      PeriodosController.upsert);
router.delete('/:id', PeriodosController.delete);

module.exports = router;

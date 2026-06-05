'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/initiativesController');
const { initiativeRules, handleValidationErrors } = require('../middleware/validateInitiative');

const router = Router();

/**
 * RESTful routes for /api/initiatives
 * Validation middleware is composed inline (OCP — new validations don't
 * require touching controller logic).
 */

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/',   [...initiativeRules, handleValidationErrors], ctrl.create);
router.put('/:id', [...initiativeRules, handleValidationErrors], ctrl.update);
// PATCH: partial update — no full-body validation, controller handles field whitelisting
router.patch('/:id', ctrl.patch);
router.delete('/:id', ctrl.remove);

module.exports = router;

'use strict';

/**
 * Categorias routes (SRP: only route registration; delegates to CategoriasController).
 */

const express = require('express');
const router = express.Router();
const CategoriasController = require('../controllers/categoriasController');

router.get('/',       CategoriasController.getAll);
router.get('/:id',    CategoriasController.getById);
router.post('/',      CategoriasController.create);
router.put('/:id',    CategoriasController.update);
router.delete('/:id', CategoriasController.delete);

module.exports = router;

'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/catalogosController');

const router = Router();

router.get('/areas', ctrl.getAreas);
router.get('/tipos-solicitud', ctrl.getTiposSolicitud);

module.exports = router;

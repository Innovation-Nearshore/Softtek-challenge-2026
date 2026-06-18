const express = require('express');
const router = express.Router();
const { getAreas, getTiposSolicitud } = require('../controllers/catalogosController');

router.get('/areas', getAreas);
router.get('/tipos-solicitud', getTiposSolicitud);

module.exports = router;

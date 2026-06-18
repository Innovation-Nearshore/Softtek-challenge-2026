const express = require('express');
const router = express.Router();
const { getTiposSolicitud } = require('../controllers/tiposSolicitudController');

router.get('/', getTiposSolicitud);

module.exports = router;

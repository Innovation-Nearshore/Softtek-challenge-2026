const express = require('express');
const router = express.Router();
const { getSolicitudes, getSolicitudById, crearSolicitud, cambiarEstado } = require('../controllers/solicitudesController');

router.get('/', getSolicitudes);
router.get('/:id', getSolicitudById);
router.post('/', crearSolicitud);
router.put('/:id/estado', cambiarEstado);

module.exports = router;

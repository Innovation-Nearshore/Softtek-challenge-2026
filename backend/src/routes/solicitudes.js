const express = require('express');
const router = express.Router();
const {
  getSolicitudes,
  createSolicitud,
  updateEstado,
  getHistorial,
} = require('../controllers/solicitudesController');

router.get('/', getSolicitudes);
router.post('/', createSolicitud);
router.patch('/:id/estado', updateEstado);
router.get('/:id/historial', getHistorial);

module.exports = router;

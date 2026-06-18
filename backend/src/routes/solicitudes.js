'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/solicitudesController');
const { validateCreateSolicitud, validateChangeStatus, validateAssignee } = require('../middleware/validate');

const router = Router();

// ── Solicitudes ──────────────────────────────────────────────────────────────
router.post('/requests', validateCreateSolicitud, ctrl.createSolicitud);
router.get('/requests', ctrl.getSolicitudes);
router.get('/requests/:id', ctrl.getSolicitudById);
router.patch('/requests/:id/status', validateChangeStatus, ctrl.changeStatus);
router.get('/requests/:id/history', ctrl.getHistory);
router.patch('/requests/:id/assignee', validateAssignee, ctrl.updateAssignee);

module.exports = router;

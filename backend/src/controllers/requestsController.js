const service = require('../services/requestsService');

const REQUIRED_FIELDS = ['tipo_solicitud_id', 'titulo', 'descripcion', 'urgencia', 'solicitante', 'email_solicitante', 'area_solicitante_id'];
const VALID_URGENCIA = ['Alta', 'Media', 'Baja'];
const VALID_ESTADOS = ['Recibida', 'En revisión', 'Resuelta', 'Rechazada', 'Cancelada'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getMissingFields = (body) => REQUIRED_FIELDS.filter((f) => !body[f]);
const isValidUrgencia = (u) => VALID_URGENCIA.includes(u);
const isValidEstado = (e) => VALID_ESTADOS.includes(e);
const isValidEmail = (e) => EMAIL_REGEX.test(e);

const getRequests = async (req, res, next) => {
  try {
    const { status, urgencia } = req.query;
    const requests = await service.getAllRequests(status, urgencia);
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

const createRequest = async (req, res, next) => {
  try {
    const missing = getMissingFields(req.body);
    if (missing.length > 0) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    if (!isValidUrgencia(req.body.urgencia)) return res.status(400).json({ error: 'urgencia must be one of: Alta, Media, Baja' });
    if (!isValidEmail(req.body.email_solicitante)) return res.status(400).json({ error: 'Invalid email format for email_solicitante' });
    const created = await service.createRequest(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: 'Missing required field: estado' });
    if (!isValidEstado(estado)) return res.status(400).json({ error: `estado must be one of: ${VALID_ESTADOS.join(', ')}` });
    const updated = await service.updateRequestStatus(id, estado);
    if (!updated) return res.status(404).json({ error: 'Request not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const getAreas = async (req, res, next) => {
  try {
    const areas = await service.getAllAreas();
    res.json(areas);
  } catch (err) {
    next(err);
  }
};

const getTiposSolicitud = async (req, res, next) => {
  try {
    const tipos = await service.getAllTiposSolicitud();
    res.json(tipos);
  } catch (err) {
    next(err);
  }
};

module.exports = { getRequests, createRequest, updateStatus, getAreas, getTiposSolicitud };
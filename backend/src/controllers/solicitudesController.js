const solicitudesService = require('../services/solicitudesService');

async function getSolicitudes(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const responsable = req.query.responsable || null;
    const result = await solicitudesService.getSolicitudes({ page, limit, responsable });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function createSolicitud(req, res, next) {
  try {
    const {
      tipo_solicitud_id,
      titulo,
      descripcion,
      urgencia,
      solicitante,
      email_solicitante,
      area_solicitante_id,
      area_asignada_id,
    } = req.body;

    // Required field validation
    const missing = [];
    if (!tipo_solicitud_id) missing.push('tipo_solicitud_id');
    if (!titulo || !titulo.trim()) missing.push('titulo');
    if (!descripcion || !descripcion.trim()) missing.push('descripcion');
    if (!urgencia) missing.push('urgencia');
    if (!solicitante || !solicitante.trim()) missing.push('solicitante');
    if (!email_solicitante || !email_solicitante.trim()) missing.push('email_solicitante');
    if (!area_solicitante_id) missing.push('area_solicitante_id');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Campos obligatorios faltantes: ${missing.join(', ')}`,
      });
    }

    const validUrgencias = ['Alta', 'Media', 'Baja'];
    if (!validUrgencias.includes(urgencia)) {
      return res.status(400).json({
        success: false,
        error: `Urgencia inválida. Valores permitidos: ${validUrgencias.join(', ')}`,
      });
    }

    const solicitud = await solicitudesService.createSolicitud({
      tipo_solicitud_id,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      urgencia,
      solicitante: solicitante.trim(),
      email_solicitante: email_solicitante.trim(),
      area_solicitante_id,
      area_asignada_id: area_asignada_id || null,
    });

    res.status(201).json({ success: true, data: solicitud });
  } catch (err) {
    next(err);
  }
}

async function updateEstado(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { estado, responsable } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        error: 'El campo "estado" es obligatorio',
      });
    }

    const validEstados = ['Recibida', 'En revisión', 'Resuelta', 'Rechazada', 'Cancelada'];
    if (!validEstados.includes(estado)) {
      return res.status(400).json({
        success: false,
        error: `Estado inválido. Valores permitidos: ${validEstados.join(', ')}`,
      });
    }

    const solicitud = await solicitudesService.updateEstado(id, estado, responsable || null);
    res.json({ success: true, data: solicitud });
  } catch (err) {
    next(err);
  }
}

async function getHistorial(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const historial = await solicitudesService.getHistorial(id);
    res.json({ success: true, data: historial });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSolicitudes, createSolicitud, updateEstado, getHistorial };

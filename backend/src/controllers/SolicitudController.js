const SolicitudModel = require('../models/SolicitudModel');

class SolicitudController {
  /**
   * GET /api/solicitudes — Listar todas las solicitudes con filtros opcionales
   */
  static async list(req, res) {
    try {
      const filters = {};
      if (req.query.tipo) filters.tipo = req.query.tipo;
      if (req.query.urgencia) filters.urgencia = req.query.urgencia;
      if (req.query.estado) filters.estado = req.query.estado;
      if (req.query.area_id) filters.area_id = req.query.area_id;

      const solicitudes = await SolicitudModel.getAllSolicitudes(filters);

      return res.status(200).json(solicitudes);
    } catch (error) {
      console.error('Error en SolicitudController.list:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener solicitudes',
      });
    }
  }

  /**
   * GET /api/solicitudes/:id — Obtener una solicitud por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const solicitud = await SolicitudModel.getSolicitudById(id);

      if (!solicitud) {
        return res.status(404).json({
          success: false,
          error: 'Solicitud no encontrada',
        });
      }

      return res.status(200).json(solicitud);
    } catch (error) {
      console.error('Error en SolicitudController.getById:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener solicitud',
      });
    }
  }

  /**
   * POST /api/solicitudes — Crear nueva solicitud
   */
  static async create(req, res) {
    try {
      const { tipo, urgencia, descripcion, solicitante, area } = req.body;

      const nuevaSolicitud = await SolicitudModel.createSolicitud({
        tipo,
        urgencia,
        descripcion,
        solicitante,
        area,
      });

      return res.status(201).json({
        success: true,
        data: nuevaSolicitud,
        message: 'Solicitud creada exitosamente',
      });
    } catch (error) {
      console.error('Error en SolicitudController.create:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Error al crear solicitud',
        message: error.message,
      });
    }
  }

  /**
   * PATCH /api/solicitudes/:id/status — Actualizar estado de solicitud
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { estado_nuevo, usuario = 'Sistema', comentario = '' } = req.body;

      const solicitud = await SolicitudModel.getSolicitudById(id);
      if (!solicitud) {
        return res.status(404).json({
          success: false,
          error: 'Solicitud no encontrada',
        });
      }

      const actualizada = await SolicitudModel.updateSolicitudStatus(
        id,
        estado_nuevo,
        usuario,
        comentario
      );

      return res.status(200).json({
        success: true,
        data: actualizada,
        message: 'Estado actualizado exitosamente',
      });
    } catch (error) {
      console.error('Error en SolicitudController.updateStatus:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Error al actualizar estado',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/solicitudes/:id/historial — Obtener historial de cambios
   */
  static async getHistorial(req, res) {
    try {
      const { id } = req.params;
      const historial = await SolicitudModel.getHistorialSolicitud(id);

      return res.status(200).json(historial);
    } catch (error) {
      console.error('Error en SolicitudController.getHistorial:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener historial',
      });
    }
  }

  /**
   * GET /api/solicitudes/metricas/dashboard — Métricas del dashboard
   */
  static async getMetricas(req, res) {
    try {
      const metricas = await SolicitudModel.getMetricas();
      return res.status(200).json({
        success: true,
        data: metricas,
      });
    } catch (error) {
      console.error('Error en SolicitudController.getMetricas:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener métricas',
      });
    }
  }

  /**
   * GET /api/solicitudes/referencias/tipos — Tipos de solicitud
   */
  static async getTiposSolicitud(req, res) {
    try {
      const tipos = await SolicitudModel.getTiposSolicitud();
      return res.status(200).json({ success: true, data: tipos });
    } catch (error) {
      console.error('Error en SolicitudController.getTiposSolicitud:', error.message);
      return res.status(500).json({ success: false, error: 'Error al obtener tipos' });
    }
  }

  /**
   * GET /api/solicitudes/referencias/areas — Áreas
   */
  static async getAreas(req, res) {
    try {
      const areas = await SolicitudModel.getAreas();
      return res.status(200).json({ success: true, data: areas });
    } catch (error) {
      console.error('Error en SolicitudController.getAreas:', error.message);
      return res.status(500).json({ success: false, error: 'Error al obtener áreas' });
    }
  }
}

module.exports = SolicitudController;

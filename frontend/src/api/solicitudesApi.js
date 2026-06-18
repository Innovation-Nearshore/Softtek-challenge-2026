import client from './client';

export const solicitudesApi = {
  // Create a new solicitud
  createSolicitud: (data) => client.post('/requests', data),

  // Get all solicitudes with optional filters
  // Backend expects: ?tipo=<id>&urgencia=<str>
  getSolicitudes: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.tipo_solicitud_id) params.append('tipo', filters.tipo_solicitud_id);
    if (filters.urgencia) params.append('urgencia', filters.urgencia);
    const query = params.toString();
    return client.get(`/requests${query ? '?' + query : ''}`);
  },

  // Get a single solicitud by ID
  getSolicitudById: (id) => client.get(`/requests/${id}`),

  // Change status of a solicitud
  // Backend expects: { estado, asignadoA?, usuario?, comentario? }
  changeStatus: (id, newStatus, assignee = null) =>
    client.patch(`/requests/${id}/status`, {
      estado: newStatus,
      asignadoA: assignee || undefined,
    }),

  // Get history/audit trail for a solicitud
  getHistory: (id) => client.get(`/requests/${id}/history`),

  // Update assignee (optional endpoint)
  // Backend expects: { asignadoA }
  updateAssignee: (id, assignee) =>
    client.patch(`/requests/${id}/assignee`, { asignadoA: assignee }),

  // Get all areas
  getAreas: () => client.get('/areas'),

  // Get all tipos_solicitud
  getTiposSolicitud: () => client.get('/tipos-solicitud'),
};

export default solicitudesApi;

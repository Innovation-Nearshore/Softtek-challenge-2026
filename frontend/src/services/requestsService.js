const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
};

export const fetchRequests = (status, urgencia) => {
  const params = new URLSearchParams();
  if (status === 'pendientes') params.set('status', 'pendientes');
  if (urgencia) params.set('urgencia', urgencia);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetch(`${API_URL}/requests${query}`).then(handleResponse);
};

export const createRequest = (payload) =>
  fetch(`${API_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const fetchAreas = () =>
  fetch(`${API_URL}/areas`).then(handleResponse);

export const fetchTiposSolicitud = () =>
  fetch(`${API_URL}/tipos-solicitud`).then(handleResponse);

export const updateRequestStatus = (id, estado) =>
  fetch(`${API_URL}/requests/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  }).then(handleResponse);
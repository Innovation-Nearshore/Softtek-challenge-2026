import axios from 'axios';

const BASE_URL = '/api/initiatives';

export async function fetchInitiatives(filters = {}) {
  const params = {};
  if (filters.estado) params.estado = filters.estado;
  if (filters.prioridad) params.prioridad = filters.prioridad;
  const response = await axios.get(BASE_URL, { params });
  return response.data.data;
}

export async function createInitiative(data) {
  const response = await axios.post(BASE_URL, data);
  return response.data;
}

export async function updateInitiativeStatus(id, estado) {
  const response = await axios.patch(`${BASE_URL}/${id}/estado`, { estado });
  return response.data;
}

// PATCH /api/initiatives/:id — update nombre, responsable, and/or prioridad inline
export async function updateInitiativeFields(id, fields) {
  const response = await axios.patch(`${BASE_URL}/${id}`, fields);
  return response.data;
}

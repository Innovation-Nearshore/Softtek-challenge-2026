/**
 * requestsService.js
 * Centralises all HTTP calls to the backend API.
 * Aligned with the real reto_c schema (solicitudes, areas, tipos_solicitud, historial_solicitudes).
 */

import axios from 'axios'
import { API_BASE_URL } from '../constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// ─── Areas ────────────────────────────────────────────────────────────────────

/**
 * Fetch all areas from reto_c.areas.
 * @returns {Promise<Array<{ id: number, nombre: string, descripcion: string|null, email_contacto: string|null }>>}
 */
export async function fetchAreas() {
  const response = await api.get('/areas')
  return response.data.data
}

// ─── Tipos de solicitud ───────────────────────────────────────────────────────

/**
 * Fetch all request types from reto_c.tipos_solicitud.
 * @returns {Promise<Array<{ id: number, codigo: string, nombre: string, descripcion: string|null, sla_horas: number, requiere_aprobacion: boolean }>>}
 */
export async function fetchTipos() {
  const response = await api.get('/tipos-solicitud')
  return response.data.data
}

// ─── Solicitudes ──────────────────────────────────────────────────────────────

/**
 * Fetch all solicitudes, optionally filtered.
 * @param {{ tipo_id?: number|string, urgencia?: string }} filters
 * @returns {Promise<Array>}
 */
export async function fetchRequests(filters = {}) {
  const params = {}
  if (filters.tipo_id)  params.tipo_id  = filters.tipo_id
  if (filters.urgencia) params.urgencia = filters.urgencia

  const response = await api.get('/requests', { params })
  return response.data.data
}

/**
 * Create a new solicitud.
 *
 * @param {{
 *   tipo_solicitud_id:   number,
 *   urgencia:            string,
 *   descripcion:         string,
 *   solicitante:         string,
 *   email_solicitante:   string,
 *   area_solicitante_id: number,
 * }} payload
 * @returns {Promise<Object>}
 */
export async function createRequest(payload) {
  const response = await api.post('/requests', payload)
  return response.data.data
}

/**
 * Update the estado of a solicitud.
 * @param {number|string} id
 * @param {string} status  - 'Recibida' | 'En revisión' | 'Resuelta'
 * @returns {Promise<Object>}
 */
export async function updateRequestStatus(id, status) {
  const response = await api.patch(`/requests/${id}/status`, { status })
  return response.data.data
}

/**
 * Delete a single solicitud by id.
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export async function deleteRequest(id) {
  await api.delete(`/requests/${id}`)
}

// ─── Error helper ─────────────────────────────────────────────────────────────

/**
 * Extract a user-friendly error message from an Axios error.
 * @param {unknown} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.map((e) => e.msg || e.message).join(', ')
    }
    if (data?.message) return data.message
    if (data?.error)   return data.error
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado.'
}

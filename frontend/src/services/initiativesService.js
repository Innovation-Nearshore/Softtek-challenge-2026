import apiClient from './apiClient'

/**
 * Service: initiativesService
 * Encapsulates all HTTP operations for initiatives.
 * Single responsibility: initiative data access.
 */
const initiativesService = {
  /**
   * Get all initiatives, optionally filtered by status.
   * @param {string|null} status - Optional status filter
   */
  getAll: (status = null) => {
    const params = status && status !== 'Todos' ? { estado: status } : {}
    return apiClient.get('/initiatives', { params })
  },

  /**
   * Get a single initiative by ID.
   * @param {number} id
   */
  getById: (id) => apiClient.get(`/initiatives/${id}`),

  /**
   * Create a new initiative.
   * @param {Object} data - Initiative payload
   */
  create: (data) => apiClient.post('/initiatives', data),

  /**
   * Update an existing initiative (full replacement).
   * @param {number} id
   * @param {Object} data - All fields
   */
  update: (id, data) => apiClient.put(`/initiatives/${id}`, data),

  /**
   * Partially update an initiative (only the provided fields).
   * Used for inline editing to avoid sending the full entity.
   * @param {number} id
   * @param {Object} fields - Only the fields to update, e.g. { nombre: 'New' }
   */
  patch: (id, fields) => apiClient.patch(`/initiatives/${id}`, fields),

  /**
   * Delete an initiative.
   * @param {number} id
   */
  delete: (id) => apiClient.delete(`/initiatives/${id}`),
}

export default initiativesService

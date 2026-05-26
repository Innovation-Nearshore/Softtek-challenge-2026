import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { solicitudesAPI } from '../services/api'

const AREAS = ['RRHH', 'TI', 'OPERACIONES', 'FINANZAS']
const URGENCIAS = ['ALTA', 'MEDIA', 'BAJA']

const URGENCIA_COLOR = {
  ALTA: 'text-danger',
  MEDIA: 'text-warning',
  BAJA: 'text-info',
}

const emptyForm = {
  tipoSolicitud: '',
  urgencia: 'MEDIA',
  descripcion: '',
  areaDestino: 'TI',
}

const Solicitud = () => {
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Auto-dismiss success after 5s
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(''), 5000)
    return () => clearTimeout(timer)
  }, [success])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' })
    setError('')
  }

  const validate = () => {
    const errors = {}
    if (!form.tipoSolicitud.trim()) errors.tipoSolicitud = 'El tipo de solicitud es requerido.'
    if (!form.descripcion.trim()) errors.descripcion = 'La descripción es requerida.'
    if (form.descripcion.trim().length < 10) errors.descripcion = 'La descripción debe tener al menos 10 caracteres.'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setLoading(true)
    try {
      await solicitudesAPI.create({
        tipoSolicitud: form.tipoSolicitud.trim(),
        urgencia: form.urgencia,
        descripcion: form.descripcion.trim(),
        areaDestino: form.areaDestino,
        solicitanteId: user.id,
      })
      setSuccess('¡Solicitud enviada exitosamente! El formulario ha sido limpiado.')
      setForm(emptyForm)
      setFieldErrors({})
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al enviar la solicitud. Intente de nuevo.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white py-3">
              <h4 className="mb-0 fw-bold">📝 Nueva Solicitud</h4>
              <small className="opacity-75">Módulo 1 – Formulario de Solicitud</small>
            </div>
            <div className="card-body p-4">
              {success && (
                <div className="alert alert-success alert-dismissible d-flex align-items-center" role="alert">
                  <span className="me-2">✓</span>
                  <span>{success}</span>
                  <button type="button" className="btn-close" onClick={() => setSuccess('')} />
                </div>
              )}
              {error && (
                <div className="alert alert-danger alert-dismissible d-flex align-items-center" role="alert">
                  <span className="me-2">⚠</span>
                  <span>{error}</span>
                  <button type="button" className="btn-close" onClick={() => setError('')} />
                </div>
              )}
              <form onSubmit={handleSubmit} noValidate>
                {/* Solicitante (read-only) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Solicitante</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">👤</span>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={user?.nombre || user?.username || ''}
                      readOnly
                      disabled
                    />
                  </div>
                  <small className="text-muted">Usuario autenticado en el sistema</small>
                </div>

                {/* Tipo de Solicitud */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Tipo de Solicitud <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="tipoSolicitud"
                    className={`form-control ${fieldErrors.tipoSolicitud ? 'is-invalid' : ''}`}
                    value={form.tipoSolicitud}
                    onChange={handleChange}
                    placeholder="Ej: Soporte técnico, Permiso, Requerimiento..."
                    maxLength={100}
                  />
                  {fieldErrors.tipoSolicitud ? (
                    <div className="invalid-feedback">{fieldErrors.tipoSolicitud}</div>
                  ) : (
                    <small className="text-muted">{form.tipoSolicitud.length}/100 caracteres</small>
                  )}
                </div>

                {/* Urgencia */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Urgencia <span className="text-danger">*</span>
                  </label>
                  <select
                    name="urgencia"
                    className="form-select"
                    value={form.urgencia}
                    onChange={handleChange}
                    required
                  >
                    {URGENCIAS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <small className={`${URGENCIA_COLOR[form.urgencia] || ''} fw-semibold`}>
                    {form.urgencia === 'ALTA' && '🔴 Atención inmediata requerida'}
                    {form.urgencia === 'MEDIA' && '🟡 Atención en plazo normal'}
                    {form.urgencia === 'BAJA' && '🔵 Cuando sea posible'}
                  </small>
                </div>

                {/* Área Destino */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Área Destino <span className="text-danger">*</span>
                  </label>
                  <select
                    name="areaDestino"
                    className="form-select"
                    value={form.areaDestino}
                    onChange={handleChange}
                    required
                  >
                    {AREAS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <small className="text-muted">Área responsable de atender la solicitud</small>
                </div>

                {/* Descripción */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Descripción <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="descripcion"
                    className={`form-control ${fieldErrors.descripcion ? 'is-invalid' : ''}`}
                    rows={4}
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Describa detalladamente su solicitud (mínimo 10 caracteres)..."
                    maxLength={1000}
                  />
                  {fieldErrors.descripcion ? (
                    <div className="invalid-feedback">{fieldErrors.descripcion}</div>
                  ) : (
                    <small className="text-muted">{form.descripcion.length}/1000 caracteres</small>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Enviando solicitud...
                    </>
                  ) : (
                    '📤 Enviar Solicitud'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Solicitud

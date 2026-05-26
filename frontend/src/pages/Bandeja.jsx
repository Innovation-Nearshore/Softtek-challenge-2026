import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { solicitudesAPI } from '../services/api'

const URGENCIAS = ['ALTA', 'MEDIA', 'BAJA']

const ESTADO_SIGUIENTE = {
  RECIBIDA: 'EN_REVISION',
  EN_REVISION: 'RESUELTA',
  RESUELTA: null,
}

const ESTADO_BADGE = {
  RECIBIDA: 'bg-secondary',
  EN_REVISION: 'bg-warning text-dark',
  RESUELTA: 'bg-success',
}

const ESTADO_LABEL = {
  RECIBIDA: '📥 RECIBIDA',
  EN_REVISION: '🔄 EN REVISIÓN',
  RESUELTA: '✅ RESUELTA',
}

const URGENCIA_BADGE = {
  ALTA: 'bg-danger',
  MEDIA: 'bg-warning text-dark',
  BAJA: 'bg-info text-dark',
}

const Bandeja = () => {
  const { user } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filters, setFilters] = useState({ tipoSolicitud: '', urgencia: '' })
  const [updating, setUpdating] = useState(null)

  // Auto-dismiss success
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(''), 4000)
    return () => clearTimeout(timer)
  }, [success])

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.tipoSolicitud.trim()) params.tipo = filters.tipoSolicitud.trim()
      if (filters.urgencia) params.urgencia = filters.urgencia
      const res = await solicitudesAPI.getBandeja(params)
      setSolicitudes(res.data)
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al cargar las solicitudes. Verifique su conexión.'
      )
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchSolicitudes()
  }, [fetchSolicitudes])

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const clearFilters = () => {
    setFilters({ tipoSolicitud: '', urgencia: '' })
  }

  const handleUpdateEstado = async (id, estadoActual) => {
    const nuevoEstado = ESTADO_SIGUIENTE[estadoActual]
    if (!nuevoEstado) return
    setUpdating(id)
    setError('')
    try {
      await solicitudesAPI.updateEstado(id, nuevoEstado)
      setSuccess(`✓ Solicitud #${id} actualizada a "${nuevoEstado.replace('_', ' ')}".`)
      // Optimistic update
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, estado: nuevoEstado } : s))
      )
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al actualizar estado.'
      )
    } finally {
      setUpdating(null)
    }
  }

  const activeFilters = filters.tipoSolicitud || filters.urgencia

  return (
    <div className="container-fluid px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h2 className="fw-bold text-primary mb-0">📋 Bandeja de Solicitudes</h2>
          <small className="text-muted">
            {user?.rol === 'ADMIN'
              ? '👑 Vista global – todas las áreas'
              : `🏢 Área asignada: ${user?.area}`}
          </small>
        </div>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={fetchSolicitudes}
          disabled={loading}
          title="Recargar solicitudes"
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm" />
          ) : (
            '↺ Actualizar'
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-5">
              <label className="form-label mb-1 small fw-semibold">🔍 Tipo de Solicitud</label>
              <input
                type="text"
                name="tipoSolicitud"
                className="form-control form-control-sm"
                placeholder="Filtrar por tipo..."
                value={filters.tipoSolicitud}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label mb-1 small fw-semibold">⚡ Urgencia</label>
              <select
                name="urgencia"
                className="form-select form-select-sm"
                value={filters.urgencia}
                onChange={handleFilterChange}
              >
                <option value="">Todas las urgencias</option>
                {URGENCIAS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <button
                className={`btn btn-sm w-100 ${activeFilters ? 'btn-warning' : 'btn-outline-secondary'}`}
                onClick={clearFilters}
                disabled={!activeFilters}
              >
                {activeFilters ? '✕ Limpiar Filtros' : 'Sin Filtros'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger alert-dismissible py-2" role="alert">
          ⚠ {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible py-2" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')} />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted mt-2">Cargando solicitudes...</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0">
                <thead className="table-primary">
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th>Tipo</th>
                    <th style={{ width: '100px' }}>Urgencia</th>
                    <th>Descripción</th>
                    <th>Solicitante</th>
                    <th style={{ width: '110px' }}>Área</th>
                    <th style={{ width: '130px' }}>Estado</th>
                    <th style={{ width: '140px' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-5 text-muted">
                        <div className="mb-2 fs-3">📭</div>
                        {activeFilters
                          ? 'No hay solicitudes que coincidan con los filtros aplicados.'
                          : 'No hay solicitudes para mostrar.'}
                      </td>
                    </tr>
                  ) : (
                    solicitudes.map((s) => (
                      <tr key={s.id}>
                        <td className="fw-semibold text-muted">{s.id}</td>
                        <td className="fw-semibold">{s.tipoSolicitud}</td>
                        <td>
                          <span className={`badge ${URGENCIA_BADGE[s.urgencia] || 'bg-secondary'}`}>
                            {s.urgencia}
                          </span>
                        </td>
                        <td style={{ maxWidth: '220px' }}>
                          <span
                            className="d-inline-block text-truncate"
                            style={{ maxWidth: '200px' }}
                            title={s.descripcion}
                          >
                            {s.descripcion}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted small">
                            {s.solicitante?.nombre || s.solicitante?.username || '-'}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-info text-dark">{s.areaDestino}</span>
                        </td>
                        <td>
                          <span className={`badge ${ESTADO_BADGE[s.estado] || 'bg-secondary'}`}>
                            {ESTADO_LABEL[s.estado] || s.estado}
                          </span>
                        </td>
                        <td>
                          {ESTADO_SIGUIENTE[s.estado] ? (
                            <button
                              className="btn btn-sm btn-outline-success"
                              disabled={updating === s.id}
                              onClick={() => handleUpdateEstado(s.id, s.estado)}
                              title={`Avanzar a: ${ESTADO_SIGUIENTE[s.estado]?.replace('_', ' ')}`}
                            >
                              {updating === s.id ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                `→ ${ESTADO_SIGUIENTE[s.estado]?.replace('_', ' ')}`
                              )}
                            </button>
                          ) : (
                            <span className="text-success fw-semibold small">✓ Completada</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-footer d-flex justify-content-between text-muted small py-2">
            <span>Total: {solicitudes.length} solicitud(es)</span>
            {activeFilters && (
              <span className="text-warning fw-semibold">⚡ Filtros activos</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Bandeja

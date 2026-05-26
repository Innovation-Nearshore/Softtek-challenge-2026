import React, { useState, useEffect } from 'react'
import { usuariosAPI } from '../services/api'

const AREAS = ['RRHH', 'TI', 'OPERACIONES', 'FINANZAS']
const ROLES = ['ADMIN', 'CONSULTOR', 'SOLICITANTE']

const emptyForm = { username: '', password: '', nombre: '', area: 'TI', rol: 'SOLICITANTE' }

const ROL_BADGE = {
  ADMIN: 'bg-danger',
  CONSULTOR: 'bg-warning text-dark',
  SOLICITANTE: 'bg-secondary',
}

const Admin = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const fetchUsuarios = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await usuariosAPI.getAll()
      setUsuarios(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar usuarios. Verifique su conexión.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const openCreateModal = () => {
    setForm(emptyForm)
    setEditMode(false)
    setSelectedId(null)
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (u) => {
    setForm({ username: u.username, password: '', nombre: u.nombre || '', area: u.area, rol: u.rol })
    setEditMode(true)
    setSelectedId(u.id)
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => {
    if (formLoading) return
    setShowModal(false)
    setFormError('')
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      if (editMode) {
        const payload = { area: form.area, rol: form.rol }
        await usuariosAPI.update(selectedId, payload)
        setSuccess('✓ Usuario actualizado correctamente.')
      } else {
        await usuariosAPI.create(form)
        setSuccess('✓ Usuario creado correctamente.')
      }
      closeModal()
      fetchUsuarios()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Error al guardar usuario.')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-0">Administración de Usuarios</h2>
          <small className="text-muted">Gestione los usuarios, roles y áreas del sistema</small>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <span className="me-1">+</span> Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted mt-2">Cargando usuarios...</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center py-2">
            <span className="fw-semibold text-muted small">
              Total: {usuarios.length} usuario(s)
            </span>
            <button className="btn btn-outline-secondary btn-sm" onClick={fetchUsuarios}>
              ↺ Actualizar
            </button>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Área</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        <div className="mb-2">👤</div>
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((u) => (
                      <tr key={u.id}>
                        <td className="text-muted">{u.id}</td>
                        <td className="fw-semibold">{u.username}</td>
                        <td>{u.nombre || '-'}</td>
                        <td>
                          <span className="badge bg-info text-dark">{u.area}</span>
                        </td>
                        <td>
                          <span className={`badge ${ROL_BADGE[u.rol] || 'bg-secondary'}`}>
                            {u.rol}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditModal(u)}
                          >
                            ✏ Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  {editMode ? '✏ Editar Usuario' : '+ Nuevo Usuario'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger py-2 small">
                      ⚠ {formError}
                    </div>
                  )}
                  {!editMode && (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Nombre completo <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          className="form-control"
                          value={form.nombre}
                          onChange={handleChange}
                          placeholder="Ej: Juan Pérez"
                          required
                          autoFocus
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Usuario / Correo <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="username"
                          className="form-control"
                          value={form.username}
                          onChange={handleChange}
                          placeholder="Nombre de usuario único"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Contraseña <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Contraseña segura"
                          required
                        />
                      </div>
                    </>
                  )}
                  {editMode && (
                    <div className="alert alert-info py-2 small mb-3">
                      ℹ Solo se puede modificar el Área y el Rol del usuario.
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Área <span className="text-danger">*</span>
                    </label>
                    <select name="area" className="form-select" value={form.area} onChange={handleChange} required>
                      {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Rol <span className="text-danger">*</span>
                    </label>
                    <select name="rol" className="form-select" value={form.rol} onChange={handleChange} required>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={formLoading}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Guardando...
                      </>
                    ) : editMode ? 'Guardar Cambios' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin

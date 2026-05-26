import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      // AuthResponse: { token, id, username, nombre, rol, area }
      const { token, ...userData } = res.data
      login(userData, token)
      // Redirect based on role
      if (userData.rol === 'ADMIN') navigate('/admin')
      else if (userData.rol === 'CONSULTOR') navigate('/bandeja')
      else if (userData.rol === 'SOLICITANTE') navigate('/solicitud')
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales inválidas. Intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">Softtek Challenge</h2>
            <p className="text-muted">Inicia sesión para continuar</p>
          </div>
          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-semibold">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                name="username"
                className="form-control"
                placeholder="Ingrese su usuario"
                value={form.username}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-control"
                placeholder="Ingrese su contraseña"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login

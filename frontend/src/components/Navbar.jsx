import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container">
        <span className="navbar-brand fw-bold">Softtek Challenge 2026</span>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user.rol === 'ADMIN' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">Administración</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/bandeja">Bandeja Global</Link>
                </li>
              </>
            )}
            {user.rol === 'CONSULTOR' && (
              <li className="nav-item">
                <Link className="nav-link" to="/bandeja">Bandeja de Solicitudes</Link>
              </li>
            )}
            {user.rol === 'SOLICITANTE' && (
              <li className="nav-item">
                <Link className="nav-link" to="/solicitud">Nueva Solicitud</Link>
              </li>
            )}
          </ul>
          <div className="navbar-text text-white me-3">
            <small>
              <strong>{user.username}</strong> | {user.rol} {user.area ? `| ${user.area}` : ''}
            </small>
          </div>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

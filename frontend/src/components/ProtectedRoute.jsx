import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirect to the appropriate page based on role
    if (user.rol === 'ADMIN') return <Navigate to="/admin" replace />
    if (user.rol === 'CONSULTOR') return <Navigate to="/bandeja" replace />
    if (user.rol === 'SOLICITANTE') return <Navigate to="/solicitud" replace />
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Solicitud from './pages/Solicitud'
import Bandeja from './pages/Bandeja'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/solicitud"
            element={
              <ProtectedRoute allowedRoles={['SOLICITANTE']}>
                <Solicitud />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bandeja"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CONSULTOR']}>
                <Bandeja />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

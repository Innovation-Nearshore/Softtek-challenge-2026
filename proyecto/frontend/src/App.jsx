import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Tabla from './components/Tabla'
import Formulario from './components/Formulario'
import Detalle from './components/Detalle'

export default function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>
        {/* Navbar */}
        <nav style={styles.nav}>
          <div style={styles.navBrand}>
            <span style={styles.brandIcon}>📋</span>
            <span style={styles.brandText}>Gestor de Solicitudes</span>
          </div>
          <div style={styles.navLinks}>
            <NavLink
              to="/"
              end
              style={({ isActive }) =>
                isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/solicitudes"
              style={({ isActive }) =>
                isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink
              }
            >
              Solicitudes
            </NavLink>
            <NavLink
              to="/nueva"
              style={({ isActive }) =>
                isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink
              }
            >
              Nueva Solicitud
            </NavLink>
          </div>
        </nav>

        {/* Main content */}
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/solicitudes" element={<Tabla />} />
            <Route path="/solicitudes/:id" element={<Detalle />} />
            <Route path="/nueva" element={<Formulario />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  nav: {
    backgroundColor: '#1e293b',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandIcon: {
    fontSize: '1.4rem',
  },
  brandText: {
    color: '#f1f5f9',
    fontWeight: '700',
    fontSize: '1.05rem',
    letterSpacing: '-0.01em',
  },
  navLinks: {
    display: 'flex',
    gap: '4px',
  },
  navLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background 0.15s, color 0.15s',
  },
  navLinkActive: {
    color: '#f1f5f9',
    backgroundColor: '#334155',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0',
  },
}

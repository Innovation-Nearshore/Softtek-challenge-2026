import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import RequestForm from './components/RequestForm'
import Inbox from './components/Inbox'
import AuditLog from './components/AuditLog'
import MetricsDashboard from './components/MetricsDashboard'
import './App.css'

function NavBar() {
  return (
    <nav className="app-nav">
      <div className="app-nav-brand">🎫 Gestión de Solicitudes</div>
      <ul className="app-nav-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Nueva Solicitud
          </NavLink>
        </li>
        <li>
          <NavLink to="/inbox" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Bandeja de Entrada
          </NavLink>
        </li>
        <li>
          <NavLink to="/metrics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Métricas
          </NavLink>
        </li>
        <li>
          <NavLink to="/audit" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Auditoría
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <NavBar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<RequestForm />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/metrics" element={<MetricsDashboard />} />
            <Route path="/audit" element={<AuditLog />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App

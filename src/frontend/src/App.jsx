import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { InitiativesProvider } from './context/InitiativesContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import KanbanBoard from './pages/KanbanBoard'
import NewInitiative from './pages/NewInitiative'
import EditInitiative from './pages/EditInitiative'

export default function App() {
  return (
    <BrowserRouter>
      <InitiativesProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/nueva" element={<NewInitiative />} />
          <Route path="/editar/:id" element={<EditInitiative />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </InitiativesProvider>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>404</h2>
      <p>Página no encontrada.</p>
      <a href="/" style={{ color: '#3b82f6', fontWeight: 600 }}>← Volver al Dashboard</a>
    </div>
  )
}

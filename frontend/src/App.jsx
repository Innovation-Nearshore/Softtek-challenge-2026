import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/templates/MainLayout'
import DashboardPage from './pages/DashboardPage'
import InitiativesPage from './pages/InitiativesPage'
import KanbanPage from './pages/KanbanPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="initiatives" element={<InitiativesPage />} />
          <Route path="kanban" element={<KanbanPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

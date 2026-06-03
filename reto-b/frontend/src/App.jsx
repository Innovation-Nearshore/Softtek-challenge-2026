import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Metricas from './pages/Metricas'
import Periodos from './pages/Periodos'
import Categorias from './pages/Categorias'
import Reporte from './pages/Reporte'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="metricas" element={<Metricas />} />
          <Route path="periodos" element={<Periodos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="reporte" element={<Reporte />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NuevaIniciativa from './pages/NuevaIniciativa';
import Kanban from './pages/Kanban';

/**
 * Punto de entrada de la SPA.
 * Define el árbol de rutas:
 *   /        → Dashboard (tabla + filtros + contadores)
 *   /nueva   → Formulario de creación de iniciativa
 *   /kanban  → Vista Kanban con Drag & Drop (BONUS 2)
 *   *        → Redirección al Dashboard
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="nueva" element={<NuevaIniciativa />} />
          <Route path="kanban" element={<Kanban />} />
          {/* Catch-all: redirige rutas desconocidas al Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

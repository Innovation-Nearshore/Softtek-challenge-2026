import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import IniciativaForm from './components/IniciativaForm';
import ProximosVencimientos from './pages/ProximosVencimientos';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nueva" element={<IniciativaForm />} />
          <Route path="/editar/:id" element={<IniciativaForm />} />
          <Route path="/proximos-vencimientos" element={<ProximosVencimientos />} />
          <Route
            path="*"
            element={
              <div className="not-found">
                <h2>404 – Página no encontrada</h2>
                <a href="/">Volver al Dashboard</a>
              </div>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

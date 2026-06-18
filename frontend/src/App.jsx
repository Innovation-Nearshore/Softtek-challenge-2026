import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BandejaPage } from './pages/BandejaPage';
import { NuevaSolicitudPage } from './pages/NuevaSolicitudPage';
import { DetalleSolicitudPage } from './pages/DetalleSolicitudPage';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<BandejaPage />} />
          <Route path="/nueva-solicitud" element={<NuevaSolicitudPage />} />
          <Route path="/solicitudes/:id" element={<DetalleSolicitudPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;

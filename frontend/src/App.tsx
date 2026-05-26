import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import RequestForm from './components/RequestForm';
import BandejaPage from './pages/BandejaPage';
import NotFoundPage from './pages/NotFoundPage';

/* ─── Shared Layout ───────────────────────────────────────────────── */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    {/* Top Nav */}
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Gestor de Solicitudes</span>
          </div>

          {/* Navigation links */}
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              Nueva Solicitud
            </NavLink>
            <NavLink
              to="/bandeja"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              Bandeja de Solicitudes
            </NavLink>
          </nav>
        </div>
      </div>
    </header>

    {/* Page content */}
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
  </div>
);

/* ─── Nueva Solicitud page ────────────────────────────────────────── */
const NuevaSolicitudPage: React.FC = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState(0);

  const handleSuccess = () => {
    setKey((k) => k + 1);
  };

  return (
    <div>
      <RequestForm key={key} onSuccess={handleSuccess} />

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/bandeja')}
          className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
        >
          Ver todas las solicitudes →
        </button>
      </div>
    </div>
  );
};

/* ─── Bandeja wrapper ────────────────────────────────────────────── */
const BandejaWrapper: React.FC = () => <BandejaPage />;

/* ─── Root App ────────────────────────────────────────────────────── */
const App: React.FC = () => (
  <Router>
    <Layout>
      <Routes>
        <Route path="/" element={<NuevaSolicitudPage />} />
        <Route path="/bandeja" element={<BandejaWrapper />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  </Router>
);

export default App;

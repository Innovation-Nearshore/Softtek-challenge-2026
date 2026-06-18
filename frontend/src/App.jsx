import { useState } from 'react';
import SolicitudesPage from './pages/SolicitudesPage';
import DashboardPage from './pages/DashboardPage';

const NAV_ITEMS = [
  { id: 'solicitudes', label: 'Solicitudes' },
  { id: 'dashboard',  label: 'Dashboard'   },
];

export default function App() {
  const [activePage, setActivePage] = useState('solicitudes');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-8">
          {/* App Title */}
          <span className="text-red-600 font-bold text-xl tracking-tight select-none">
            Gestión de Solicitudes
          </span>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 ml-4">
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activePage === id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-6">
        {activePage === 'solicitudes' && <SolicitudesPage />}
        {activePage === 'dashboard'   && <DashboardPage />}
      </main>
    </div>
  );
}

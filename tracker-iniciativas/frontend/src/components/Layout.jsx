import { NavLink, Outlet } from 'react-router-dom';

/**
 * Layout principal de la aplicación.
 * Contiene el encabezado con navegación y el área de contenido (Outlet).
 */
export default function Layout() {
  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-white text-indigo-700 shadow-sm'
        : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <header className="bg-indigo-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow">
                <svg
                  className="w-5 h-5 text-indigo-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Tracker de Iniciativas
              </span>
            </div>

            {/* Navigation links */}
            <nav className="flex items-center gap-2" aria-label="Navegación principal">
              <NavLink to="/" end className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/kanban" className={navLinkClass}>
                Kanban
              </NavLink>
              <NavLink to="/nueva" className={navLinkClass}>
                + Nueva Iniciativa
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-400">
            Tracker de Iniciativas &mdash; Reto A &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

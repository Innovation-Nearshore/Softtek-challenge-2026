import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-container">
          <Link to="/" className="header-logo">
            <svg className="header-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
            <span className="header-logo-text">Gestión de Iniciativas</span>
          </Link>

          <nav className="header-nav">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'nav-link--active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Panel
            </Link>
            <Link
              to="/nueva"
              className={`nav-link nav-link--primary ${location.pathname === '/nueva' ? 'nav-link--active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Nueva Iniciativa
            </Link>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="main-container">
          {children}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <p>© {new Date().getFullYear()} Gestión de Iniciativas · Sistema de Seguimiento de Proyectos</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">🚀</span>
          <span className="navbar__logo-text">
            Gestión de <span>Iniciativas</span>
          </span>
        </Link>
      </div>
      <div className="navbar__links">
        <Link
          to="/"
          className={`navbar__link ${pathname === '/' ? 'navbar__link--active' : ''}`}
        >
          📋 Dashboard
        </Link>
        <Link
          to="/proximos-vencimientos"
          className={`navbar__link ${pathname === '/proximos-vencimientos' ? 'navbar__link--active' : ''}`}
        >
          ⏰ Vencimientos
        </Link>
        <Link
          to="/nueva"
          className={`navbar__link navbar__link--cta ${pathname === '/nueva' ? 'navbar__link--active' : ''}`}
        >
          + Nueva Iniciativa
        </Link>
      </div>
    </nav>
  );
}

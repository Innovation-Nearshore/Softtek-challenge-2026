import { Link } from 'react-router-dom';
import './Navbar.css';

export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">📋 Gestor de Solicitudes</Link>
        </div>
        <ul className="navbar-links">
          <li>
            <Link to="/">Bandeja</Link>
          </li>
          <li>
            <Link to="/nueva-solicitud" className="btn-primary">
              + Nueva Solicitud
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

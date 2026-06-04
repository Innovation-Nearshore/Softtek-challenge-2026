import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.logo}>🚀</span>
        <span className={styles.title}>Tracker de Iniciativas</span>
      </div>
      <ul className={styles.links}>
        <li>
          <Link to="/" className={pathname === '/' ? styles.active : ''}>
            📊 Dashboard
          </Link>
        </li>
        <li>
          <Link to="/kanban" className={pathname === '/kanban' ? styles.active : ''}>
            🗂 Kanban
          </Link>
        </li>
        <li>
          <Link to="/nueva" className={pathname === '/nueva' ? styles.active : ''}>
            + Nueva Iniciativa
          </Link>
        </li>
      </ul>
    </nav>
  )
}

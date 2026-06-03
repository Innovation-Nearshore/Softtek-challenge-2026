import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/metricas', label: 'Métricas' },
  { to: '/periodos', label: 'Períodos' },
  { to: '/categorias', label: 'Categorías' },
  { to: '/reporte', label: 'Reporte PDF' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-indigo-700 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">📊 Métricas Mensuales</span>
          <nav className="flex gap-4 text-sm font-medium">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  isActive
                    ? 'underline underline-offset-4 text-white'
                    : 'text-indigo-200 hover:text-white transition-colors'
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-gray-400 py-3">
        Reto B — Softtek 2026
      </footer>
    </div>
  )
}

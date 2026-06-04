/**
 * Dashboard.jsx
 * Main dashboard page: composes ContadoresEstado, FiltrosIniciativas, and TablaIniciativas.
 * Single data source via useIniciativas hook — all components share the same state.
 */

import ContadoresEstado from '../components/ContadoresEstado';
import FiltrosIniciativas from '../components/FiltrosIniciativas';
import TablaIniciativas from '../components/TablaIniciativas';
import ProximosVencimientos from '../components/ProximosVencimientos';
import useIniciativas from '../hooks/useIniciativas';

const Dashboard = () => {
  const {
    iniciativas,
    loading,
    error,
    filtroEstado,
    filtroPrioridad,
    setFiltroEstado,
    setFiltroPrioridad,
    clearFilters,
    refresh,
  } = useIniciativas();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Iniciativas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Seguimiento en tiempo real de todas las iniciativas registradas.
          </p>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white
                     px-4 py-2 text-sm font-medium text-gray-700 shadow-sm
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300
                     disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Actualizar datos"
        >
          <svg
            className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualizar
        </button>
      </div>

      {/* BONUS 1 — Próximos vencimientos panel (next 7 days, backend-filtered) */}
      <ProximosVencimientos days={7} />

      {/* Summary counters — always use ALL unfiltered data for accurate totals */}
      <ContadoresEstado iniciativas={iniciativas} />

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Filters row */}
      <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Filtrar iniciativas
        </p>
        <FiltrosIniciativas
          filtroEstado={filtroEstado}
          filtroPrioridad={filtroPrioridad}
          onEstadoChange={setFiltroEstado}
          onPrioridadChange={setFiltroPrioridad}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Data table */}
      <TablaIniciativas
        iniciativas={iniciativas}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default Dashboard;

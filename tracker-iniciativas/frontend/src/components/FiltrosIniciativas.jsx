/**
 * FiltrosIniciativas.jsx
 * Dropdown filters for estado and prioridad.
 * Calls parent callbacks to update active filters; supports clearing all filters.
 */

import { ESTADOS, PRIORIDADES } from '../utils/formatters';

/**
 * @param {{
 *   filtroEstado: string,
 *   filtroPrioridad: string,
 *   onEstadoChange: (v: string) => void,
 *   onPrioridadChange: (v: string) => void,
 *   onClearFilters: () => void,
 * }} props
 */
const FiltrosIniciativas = ({
  filtroEstado = '',
  filtroPrioridad = '',
  onEstadoChange,
  onPrioridadChange,
  onClearFilters,
}) => {
  const hasActiveFilters = filtroEstado || filtroPrioridad;

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Estado filter */}
      <div className="flex flex-col gap-1 min-w-[160px]">
        <label
          htmlFor="filtro-estado"
          className="text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Estado
        </label>
        <select
          id="filtro-estado"
          value={filtroEstado}
          onChange={(e) => onEstadoChange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm
                     focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300
                     transition cursor-pointer"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {/* Prioridad filter */}
      <div className="flex flex-col gap-1 min-w-[160px]">
        <label
          htmlFor="filtro-prioridad"
          className="text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Prioridad
        </label>
        <select
          id="filtro-prioridad"
          value={filtroPrioridad}
          onChange={(e) => onPrioridadChange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm
                     focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300
                     transition cursor-pointer"
        >
          <option value="">Todas las prioridades</option>
          {PRIORIDADES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Clear filters button — only visible when at least one filter is active */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300
                     bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm
                     hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2
                     focus:ring-indigo-300 transition self-end"
          aria-label="Limpiar filtros"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Limpiar filtros
        </button>
      )}

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 self-end pb-0.5">
          {filtroEstado && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
              Estado: {filtroEstado}
            </span>
          )}
          {filtroPrioridad && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
              Prioridad: {filtroPrioridad}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FiltrosIniciativas;

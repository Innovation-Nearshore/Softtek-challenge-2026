/**
 * TablaIniciativas.jsx
 * Responsive data table for displaying iniciativas from PostgreSQL via Express BFF.
 * Handles loading, empty, and error states.
 */

import { formatFecha, getEstadoClasses, getPrioridadClasses } from '../utils/formatters';

// ─── Skeleton row for loading state ──────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 rounded bg-gray-200" style={{ width: `${60 + (i % 3) * 15}%` }} />
      </td>
    ))}
  </tr>
);

// ─── Badge helpers ────────────────────────────────────────────────────────────
const EstadoBadge = ({ estado }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getEstadoClasses(estado)}`}
  >
    {estado}
  </span>
);

const PrioridadBadge = ({ prioridad }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPrioridadClasses(prioridad)}`}
  >
    {prioridad}
  </span>
);

// ─── Main component ───────────────────────────────────────────────────────────
/**
 * @param {{
 *   iniciativas: Array,
 *   loading: boolean,
 *   error: string | null,
 * }} props
 */
const TablaIniciativas = ({ iniciativas = [], loading = false, error = null }) => {
  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <svg
          className="mx-auto mb-3 h-10 w-10 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
        <p className="text-sm font-semibold text-red-700">Error al cargar iniciativas</p>
        <p className="mt-1 text-xs text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          {/* Head */}
          <thead className="bg-gray-50">
            <tr>
              {[
                'Nombre',
                'Responsable',
                'Estado',
                'Fecha Límite',
                'Prioridad',
                'Descripción',
              ].map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100 bg-white">
            {/* Loading skeletons */}
            {loading &&
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

            {/* Empty state */}
            {!loading && iniciativas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <svg
                    className="mx-auto mb-3 h-10 w-10 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-500">
                    No se encontraron iniciativas
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Intenta cambiar los filtros o crea una nueva iniciativa.
                  </p>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading &&
              iniciativas.map((item) => (
                <tr
                  key={item.id}
                  className="group transition-colors hover:bg-indigo-50/40"
                >
                  {/* Nombre */}
                  <td className="max-w-[180px] px-4 py-3">
                    <span
                      className="block truncate font-medium text-gray-900"
                      title={item.nombre}
                    >
                      {item.nombre}
                    </span>
                  </td>

                  {/* Responsable */}
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {item.responsable}
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <EstadoBadge estado={item.estado} />
                  </td>

                  {/* Fecha límite */}
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {item.fecha_limite ? formatFecha(item.fecha_limite) : '—'}
                  </td>

                  {/* Prioridad */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PrioridadBadge prioridad={item.prioridad} />
                  </td>

                  {/* Descripción */}
                  <td className="max-w-[240px] px-4 py-3 text-gray-500">
                    <span
                      className="block truncate text-xs"
                      title={item.descripcion}
                    >
                      {item.descripcion || '—'}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      {!loading && iniciativas.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-right">
          <span className="text-xs text-gray-400">
            {iniciativas.length} iniciativa{iniciativas.length !== 1 ? 's' : ''} encontrada
            {iniciativas.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default TablaIniciativas;

/**
 * ProximosVencimientos.jsx
 * BONUS 1 — Sección de próximos vencimientos.
 * Fetches from GET /api/iniciativas/proximos-vencimientos (backend filtering).
 * Shows a card list ordered by fecha_limite ASC with urgency colour-coding.
 */

import { useState, useEffect, useCallback } from 'react';
import { getProximosVencimientos } from '../services/iniciativasService';
import { formatFecha, getPrioridadClasses } from '../utils/formatters';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns how many full calendar days remain until a given date string.
 * Returns 0 if the date is today or already past.
 */
const diasRestantes = (fechaStr) => {
  if (!fechaStr) return null;
  const normalized = String(fechaStr).includes('T') ? fechaStr : fechaStr + 'T00:00:00';
  const limite = new Date(normalized);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  limite.setHours(0, 0, 0, 0);
  const diff = Math.round((limite - hoy) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : 0;
};

/**
 * Urgency tier based on days remaining:
 *  0-1  → critical  (red)
 *  2-3  → warning   (orange / amber)
 *  4-7  → caution   (yellow)
 */
const urgencyConfig = (dias) => {
  if (dias <= 1) {
    return {
      bar: 'bg-red-500',
      badge: 'bg-red-100 text-red-700 border border-red-300',
      icon: '🔴',
      label: dias === 0 ? 'Vence hoy' : 'Vence mañana',
    };
  }
  if (dias <= 3) {
    return {
      bar: 'bg-orange-400',
      badge: 'bg-orange-100 text-orange-700 border border-orange-300',
      icon: '🟠',
      label: `${dias} días`,
    };
  }
  return {
    bar: 'bg-yellow-400',
    badge: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    icon: '🟡',
    label: `${dias} días`,
  };
};

// ─── Skeleton card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="mb-2 h-3 w-1/4 rounded bg-gray-200" />
    <div className="h-4 w-3/4 rounded bg-gray-200" />
    <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const ProximosVencimientos = ({ days = 7 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProximosVencimientos(days);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error al cargar próximos vencimientos');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section
      aria-labelledby="proximos-vencimientos-title"
      className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5 shadow-sm"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">⏰</span>
          <h2
            id="proximos-vencimientos-title"
            className="text-sm font-semibold text-amber-800"
          >
            Próximos vencimientos
            <span className="ml-2 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
              {days} días
            </span>
          </h2>
        </div>

        {/* Refresh mini-button */}
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          aria-label="Actualizar próximos vencimientos"
          className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-100 focus:outline-none
                     focus:ring-2 focus:ring-amber-400 disabled:opacity-40 transition"
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
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <span className="text-3xl" aria-hidden="true">✅</span>
          <p className="text-sm font-medium text-amber-700">
            No hay iniciativas por vencer en los próximos {days} días.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="space-y-3" role="list">
          {items.map((item) => {
            const dias = diasRestantes(item.fecha_limite);
            const urgency = urgencyConfig(dias);
            return (
              <li
                key={item.id}
                className="relative overflow-hidden rounded-xl border border-white bg-white px-4 py-3 shadow-sm"
              >
                {/* Urgency colour bar on the left edge */}
                <span
                  className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${urgency.bar}`}
                  aria-hidden="true"
                />

                <div className="pl-3">
                  {/* Top row: name + urgency badge */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">
                      {item.nombre}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${urgency.badge}`}
                    >
                      {urgency.icon} {urgency.label}
                    </span>
                  </div>

                  {/* Bottom row: responsable · fecha · prioridad */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {item.responsable}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatFecha(item.fecha_limite)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 font-medium ${getPrioridadClasses(item.prioridad)}`}>
                      {item.prioridad}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default ProximosVencimientos;

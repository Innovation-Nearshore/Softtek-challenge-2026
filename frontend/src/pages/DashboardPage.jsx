import { useState, useEffect, useCallback, useRef } from 'react';
import { getMetrics } from '../services/api';

const POLL_INTERVAL_MS = 5000;

// Color mappings per category value
const ESTADO_COLORS = {
  'Recibida':    { border: 'border-l-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700'   },
  'En revisión': { border: 'border-l-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  'Resuelta':    { border: 'border-l-green-500',  bg: 'bg-green-50',  text: 'text-green-700'  },
};

const URGENCIA_COLORS = {
  'Alta':  { border: 'border-l-red-500',    bg: 'bg-red-50',    text: 'text-red-700'    },
  'Media': { border: 'border-l-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
  'Baja':  { border: 'border-l-gray-400',   bg: 'bg-gray-50',   text: 'text-gray-600'   },
};

const DEFAULT_CARD = { border: 'border-l-gray-300', bg: 'bg-gray-50', text: 'text-gray-600' };

function SkeletonCard() {
  return (
    <div className="border-l-4 border-l-gray-200 bg-gray-50 rounded-lg p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-1/3" />
    </div>
  );
}

function MetricCard({ label, count, colorMap }) {
  const colors = colorMap[label] || DEFAULT_CARD;
  return (
    <div
      className={`border-l-4 ${colors.border} ${colors.bg} rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow`}
    >
      <p className={`text-sm font-medium uppercase tracking-wide ${colors.text} mb-1`}>
        {label}
      </p>
      <p className="text-4xl font-bold text-gray-800">{count}</p>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-base font-semibold text-gray-500 uppercase tracking-widest mb-3 mt-8 first:mt-0">
      {children}
    </h2>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);   // { byEstado: [...], byUrgencia: [...] }
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchMetrics = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    const { data, error: err } = await getMetrics();
    if (err) {
      setError(err);
    } else {
      // data.data = { byEstado: [...], byUrgencia: [...] }
      const payload = data?.data ?? data;
      setMetrics(payload);
      setError(null);
      setLastUpdated(new Date());
    }
    if (showLoader) setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    fetchMetrics(true);
  }, [fetchMetrics]);

  // Polling
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchMetrics(false);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchMetrics]);

  const formatTime = (date) =>
    date
      ? date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '—';

  // Skeleton grid
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-red-600">Dashboard de Métricas</h1>
        </div>
        <SectionTitle>Por Estado</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
        <SectionTitle>Por Urgencia</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-red-600 mb-6">Dashboard de Métricas</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 text-sm">
          <p className="font-semibold mb-1">Error al cargar métricas</p>
          <p>{error}</p>
          <button
            onClick={() => fetchMetrics(true)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const byEstado   = metrics?.byEstado   ?? [];
  const byUrgencia = metrics?.byUrgencia ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <h1 className="text-2xl font-bold text-red-600">Dashboard de Métricas</h1>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span
            className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"
            title="Actualización automática activa"
          />
          <span>
            Última actualización:{' '}
            <span className="font-medium text-gray-500">{formatTime(lastUpdated)}</span>
          </span>
          <span className="text-gray-300">·</span>
          <span>cada {POLL_INTERVAL_MS / 1000}s</span>
        </div>
      </div>

      {/* Estado cards */}
      <SectionTitle>Solicitudes por Estado</SectionTitle>
      {byEstado.length === 0 ? (
        <p className="text-sm text-gray-400 mb-4">Sin datos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
          {byEstado.map(({ estado, total }) => (
            <MetricCard
              key={estado}
              label={estado ?? 'Sin Dato'}
              count={total}
              colorMap={ESTADO_COLORS}
            />
          ))}
        </div>
      )}

      {/* Urgencia cards */}
      <SectionTitle>Solicitudes por Urgencia</SectionTitle>
      {byUrgencia.length === 0 ? (
        <p className="text-sm text-gray-400">Sin datos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {byUrgencia.map(({ urgencia, total }) => (
            <MetricCard
              key={urgencia}
              label={urgencia ?? 'Sin Dato'}
              count={total}
              colorMap={URGENCIA_COLORS}
            />
          ))}
        </div>
      )}
    </div>
  );
}

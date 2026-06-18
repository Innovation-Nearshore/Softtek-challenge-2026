import { useState, useEffect, useCallback } from 'react';
import { getMetrics } from '../api';

const POLL_INTERVAL = 30_000; // 30 seconds

const ESTADO_META = [
  { key: 'Recibida',     icon: '📥', color: '#0369a1', bg: '#e0f2fe' },
  { key: 'En revisión',  icon: '🔍', color: '#92400e', bg: '#fef3c7' },
  { key: 'Resuelta',     icon: '✅', color: '#166534', bg: '#dcfce7' },
];

const URGENCIA_META = [
  { key: 'Alta',  icon: '🔴', color: '#b91c1c', bg: '#fee2e2' },
  { key: 'Media', icon: '🟡', color: '#92400e', bg: '#fef9c3' },
  { key: 'Baja',  icon: '🟢', color: '#166534', bg: '#dcfce7' },
];

function KpiCard({ icon, label, count, color, bg, loading }) {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${bg}`,
        borderRadius: 12,
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        minWidth: 150,
        flex: '1 1 150px',
        transition: 'box-shadow 0.2s',
      }}
    >
      <span style={{ fontSize: '2rem' }}>{icon}</span>
      <span
        style={{
          fontSize: loading ? '1.6rem' : '2.4rem',
          fontWeight: 800,
          color,
          lineHeight: 1,
        }}
      >
        {loading ? '…' : count}
      </span>
      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569', textAlign: 'center' }}>
        {label}
      </span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3
      style={{
        fontSize: '0.8rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: '#64748b',
        margin: '28px 0 12px',
      }}
    >
      {children}
    </h3>
  );
}

export default function MetricsDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await getMetrics();
      setData(res.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  // Build maps for lookup
  const estadoMap   = Object.fromEntries((data?.by_estado   || []).map(r => [r.estado,   r.count]));
  const urgenciaMap = Object.fromEntries((data?.by_urgencia || []).map(r => [r.urgencia, r.count]));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2 className="page-title" style={{ margin: 0 }}>📊 Panel de Métricas</h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { setLoading(true); fetchData(); }}
          disabled={loading}
          title="Actualizar ahora"
        >
          🔄 Actualizar
        </button>
      </div>
      {lastUpdated && (
        <p className="text-muted" style={{ fontSize: '0.78rem', marginBottom: 20 }}>
          Última actualización: {lastUpdated.toLocaleTimeString('es-AR')} · auto-refresh cada 30 s
        </p>
      )}

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* By Estado */}
      <SectionTitle>Por Estado</SectionTitle>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {ESTADO_META.map(({ key, icon, color, bg }) => (
          <KpiCard
            key={key}
            icon={icon}
            label={key}
            count={estadoMap[key] ?? 0}
            color={color}
            bg={bg}
            loading={loading}
          />
        ))}
      </div>

      {/* By Urgencia */}
      <SectionTitle>Por Urgencia</SectionTitle>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {URGENCIA_META.map(({ key, icon, color, bg }) => (
          <KpiCard
            key={key}
            icon={icon}
            label={key}
            count={urgenciaMap[key] ?? 0}
            color={color}
            bg={bg}
            loading={loading}
          />
        ))}
      </div>

      {/* Total */}
      {data && (
        <p className="text-muted" style={{ marginTop: 24, fontSize: '0.85rem' }}>
          Total de solicitudes:{' '}
          <strong>
            {(data.by_estado || []).reduce((acc, r) => acc + Number(r.count), 0)}
          </strong>
        </p>
      )}
    </div>
  );
}

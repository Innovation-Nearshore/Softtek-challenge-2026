import { useState, useEffect } from 'react'
import { getDashboardMetrics } from '../api'

const estadoColor = {
  'Recibida': '#6366f1',
  'En revisión': '#f59e0b',
  'Resuelta': '#10b981',
  'Rechazada': '#ef4444',
  'Cancelada': '#6b7280',
}

const urgenciaColor = {
  Alta: '#dc2626',
  Media: '#d97706',
  Baja: '#16a34a',
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboardMetrics()
      .then((res) => {
        setMetrics(res.data)
        setLoading(false)
      })
      .catch(() => {
        setError('Error al cargar métricas')
        setLoading(false)
      })
  }, [])

  if (loading) return <div style={styles.center}>Cargando métricas...</div>
  if (error) return <div style={styles.errorBox}>{error}</div>

  const total = metrics?.total || 0
  const porEstado = metrics?.por_estado || []
  const porUrgencia = metrics?.por_urgencia || []

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dashboard</h2>

      {/* KPI Total */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiValue}>{total}</div>
          <div style={styles.kpiLabel}>Total Solicitudes</div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Por Estado */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Por Estado</h3>
          {porEstado.length === 0 ? (
            <p style={styles.empty}>Sin datos</p>
          ) : (
            <div style={styles.list}>
              {porEstado.map((item) => {
                const pct = total > 0 ? Math.round((item.cantidad / total) * 100) : 0
                const color = estadoColor[item.estado] || '#94a3b8'
                return (
                  <div key={item.estado} style={styles.listItem}>
                    <div style={styles.listHeader}>
                      <span
                        style={{
                          ...styles.dot,
                          backgroundColor: color,
                        }}
                      />
                      <span style={styles.listName}>{item.estado}</span>
                      <span style={styles.listCount}>{item.cantidad}</span>
                    </div>
                    <div style={styles.barBg}>
                      <div
                        style={{
                          ...styles.barFill,
                          width: `${pct}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <div style={styles.pct}>{pct}%</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Por Urgencia */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Por Urgencia</h3>
          {porUrgencia.length === 0 ? (
            <p style={styles.empty}>Sin datos</p>
          ) : (
            <div style={styles.list}>
              {porUrgencia.map((item) => {
                const pct = total > 0 ? Math.round((item.cantidad / total) * 100) : 0
                const color = urgenciaColor[item.urgencia] || '#94a3b8'
                return (
                  <div key={item.urgencia} style={styles.listItem}>
                    <div style={styles.listHeader}>
                      <span
                        style={{
                          ...styles.dot,
                          backgroundColor: color,
                        }}
                      />
                      <span style={styles.listName}>{item.urgencia}</span>
                      <span style={styles.listCount}>{item.cantidad}</span>
                    </div>
                    <div style={styles.barBg}>
                      <div
                        style={{
                          ...styles.barFill,
                          width: `${pct}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <div style={styles.pct}>{pct}%</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '24px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '24px',
  },
  kpiRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  kpiCard: {
    backgroundColor: '#2563eb',
    color: '#fff',
    borderRadius: '12px',
    padding: '24px 40px',
    textAlign: 'center',
    minWidth: '160px',
    boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
  },
  kpiValue: {
    fontSize: '2.5rem',
    fontWeight: '800',
    lineHeight: 1,
  },
  kpiLabel: {
    fontSize: '0.9rem',
    marginTop: '8px',
    opacity: 0.9,
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 16px 0',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  listItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  listName: {
    flex: 1,
    fontSize: '0.9rem',
    color: '#374151',
  },
  listCount: {
    fontWeight: '700',
    fontSize: '0.9rem',
    color: '#1e293b',
  },
  barBg: {
    height: '6px',
    backgroundColor: '#f1f5f9',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.4s ease',
  },
  pct: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textAlign: 'right',
  },
  center: {
    textAlign: 'center',
    padding: '60px',
    color: '#64748b',
  },
  errorBox: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    margin: '24px',
  },
  empty: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: 0,
  },
}

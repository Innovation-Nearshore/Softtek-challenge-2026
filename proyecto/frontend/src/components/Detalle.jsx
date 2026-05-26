import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSolicitudById } from '../api'

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

export default function Detalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [solicitud, setSolicitud] = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getSolicitudById(id)
      .then((res) => {
        setSolicitud(res.data.solicitud)
        setHistorial(res.data.historial || [])
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudo cargar la solicitud')
        setLoading(false)
      })
  }, [id])

  if (loading) return <div style={styles.center}>Cargando...</div>
  if (error) return <div style={styles.errorBox}>{error}</div>
  if (!solicitud) return null

  const eColor = estadoColor[solicitud.estado] || '#94a3b8'
  const uColor = urgenciaColor[solicitud.urgencia] || '#94a3b8'

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/solicitudes')}>
        ← Volver a Solicitudes
      </button>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.cardHeader}>
          <div>
            <span style={styles.ticket}>{solicitud.numero_ticket}</span>
            <h2 style={styles.titulo}>{solicitud.titulo}</h2>
          </div>
          <div style={styles.badges}>
            <span
              style={{
                ...styles.badge,
                backgroundColor: eColor + '22',
                color: eColor,
                border: `1px solid ${eColor}44`,
              }}
            >
              {solicitud.estado}
            </span>
            <span
              style={{
                ...styles.badge,
                backgroundColor: uColor + '22',
                color: uColor,
                border: `1px solid ${uColor}44`,
              }}
            >
              {solicitud.urgencia}
            </span>
          </div>
        </div>

        {/* Datos principales */}
        <div style={styles.grid}>
          <Field label="Tipo" value={solicitud.tipo_nombre || solicitud.tipo_solicitud_id} />
          <Field label="Solicitante" value={solicitud.solicitante} />
          <Field label="Email" value={solicitud.email_solicitante} />
          <Field label="Área" value={solicitud.area_nombre || '—'} />
          <Field
            label="Fecha de Creación"
            value={
              solicitud.fecha_creacion
                ? new Date(solicitud.fecha_creacion).toLocaleString('es-CO')
                : '—'
            }
          />
          <Field
            label="Fecha de Vencimiento"
            value={
              solicitud.fecha_vencimiento
                ? new Date(solicitud.fecha_vencimiento).toLocaleString('es-CO')
                : '—'
            }
          />
          {solicitud.asignado_a && (
            <Field label="Asignado a" value={solicitud.asignado_a} />
          )}
          {solicitud.fecha_resolucion && (
            <Field
              label="Fecha de Resolución"
              value={new Date(solicitud.fecha_resolucion).toLocaleString('es-CO')}
            />
          )}
        </div>

        {/* Descripción */}
        {solicitud.descripcion && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Descripción</div>
            <p style={styles.description}>{solicitud.descripcion}</p>
          </div>
        )}

        {/* Solución */}
        {solicitud.solucion && (
          <div style={{ ...styles.section, marginTop: '16px' }}>
            <div style={styles.sectionTitle}>Solución</div>
            <p style={styles.description}>{solicitud.solucion}</p>
          </div>
        )}
      </div>

      {/* Historial */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Historial de Cambios</h3>
        {historial.length === 0 ? (
          <p style={styles.empty}>Sin registros en el historial</p>
        ) : (
          <div style={styles.timeline}>
            {historial.map((h, idx) => (
              <div key={h.id || idx} style={styles.timelineItem}>
                <div style={styles.timelineDot} />
                {idx < historial.length - 1 && <div style={styles.timelineLine} />}
                <div style={styles.timelineContent}>
                  <div style={styles.timelineHeader}>
                    <span style={styles.timelineChange}>
                      <span style={{ color: estadoColor[h.estado_anterior] || '#94a3b8' }}>
                        {h.estado_anterior || '—'}
                      </span>
                      {' → '}
                      <span style={{ color: estadoColor[h.estado_nuevo] || '#10b981' }}>
                        {h.estado_nuevo || '—'}
                      </span>
                    </span>
                    <span style={styles.timelineActor}>{h.usuario || 'Sistema'}</span>
                  </div>
                  {h.comentario && (
                    <p style={styles.timelineComment}>{h.comentario}</p>
                  )}
                  <div style={styles.timelineDate}>
                    {h.fecha_cambio
                      ? new Date(h.fecha_cambio).toLocaleString('es-CO')
                      : '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div style={fieldStyles.wrapper}>
      <div style={fieldStyles.label}>{label}</div>
      <div style={fieldStyles.value}>{value || '—'}</div>
    </div>
  )
}

const fieldStyles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  value: {
    fontSize: '0.95rem',
    color: '#1e293b',
  },
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '860px',
    margin: '0 auto',
  },
  backBtn: {
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    marginBottom: '20px',
    color: '#374151',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  ticket: {
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    backgroundColor: '#f1f5f9',
    padding: '2px 10px',
    borderRadius: '4px',
    color: '#334155',
    display: 'inline-block',
    marginBottom: '8px',
  },
  titulo: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  badges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  section: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '16px',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 16px 0',
  },
  description: {
    fontSize: '0.95rem',
    color: '#374151',
    lineHeight: 1.6,
    margin: '8px 0 0 0',
    whiteSpace: 'pre-wrap',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  timelineItem: {
    display: 'flex',
    gap: '12px',
    position: 'relative',
    paddingBottom: '20px',
  },
  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    flexShrink: 0,
    marginTop: '4px',
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    left: '5px',
    top: '16px',
    bottom: '0',
    width: '2px',
    backgroundColor: '#e2e8f0',
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '12px',
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  timelineChange: {
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  timelineActor: {
    fontSize: '0.8rem',
    color: '#6b7280',
    backgroundColor: '#e2e8f0',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  timelineComment: {
    fontSize: '0.85rem',
    color: '#374151',
    margin: '6px 0 0 0',
  },
  timelineDate: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '6px',
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

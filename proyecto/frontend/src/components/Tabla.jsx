import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSolicitudes, updateEstado, getTiposSolicitud } from '../api'

const URGENCIAS = ['Alta', 'Media', 'Baja']
const ESTADOS = ['Recibida', 'En revisión', 'Resuelta', 'Rechazada', 'Cancelada']

const urgenciaColor = {
  Alta: '#dc2626',
  Media: '#d97706',
  Baja: '#16a34a',
}

const estadoColor = {
  'Recibida': '#6366f1',
  'En revisión': '#f59e0b',
  'Resuelta': '#10b981',
  'Rechazada': '#ef4444',
  'Cancelada': '#6b7280',
}

export default function Tabla() {
  const [solicitudes, setSolicitudes] = useState([])
  const [tipos, setTipos] = useState([])
  const [filters, setFilters] = useState({ urgencia: '', tipo: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getTiposSolicitud()
      .then((res) => setTipos(res.data))
      .catch(() => setTipos([]))
  }, [])

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSolicitudes(filters)
      setSolicitudes(res.data)
    } catch {
      setError('Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchSolicitudes()
  }, [fetchSolicitudes])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleEstadoChange = async (e, id) => {
    e.stopPropagation()
    const nuevoEstado = e.target.value
    try {
      await updateEstado(id, nuevoEstado, 'Cambio inline', 'Usuario')
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, estado: nuevoEstado } : s))
      )
    } catch {
      alert('Error al actualizar el estado')
    }
  }

  const handleRowClick = (id) => {
    navigate(`/solicitudes/${id}`)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Solicitudes</h2>
        <button style={styles.newBtn} onClick={() => navigate('/nueva')}>
          + Nueva Solicitud
        </button>
      </div>

      {/* Filtros */}
      <div style={styles.filters}>
        <div style={styles.filterItem}>
          <label style={styles.filterLabel}>Urgencia</label>
          <select
            name="urgencia"
            value={filters.urgencia}
            onChange={handleFilterChange}
            style={styles.filterSelect}
          >
            <option value="">Todas</option>
            {URGENCIAS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterItem}>
          <label style={styles.filterLabel}>Tipo</label>
          <select
            name="tipo"
            value={filters.tipo}
            onChange={handleFilterChange}
            style={styles.filterSelect}
          >
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.codigo}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <button style={styles.refreshBtn} onClick={fetchSolicitudes}>
          ↻ Actualizar
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Cargando...</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Ticket</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Título</th>
                <th style={styles.th}>Urgencia</th>
                <th style={styles.th}>Solicitante</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={styles.empty}>
                    No hay solicitudes que mostrar
                  </td>
                </tr>
              ) : (
                solicitudes.map((s) => (
                  <tr
                    key={s.id}
                    style={styles.tr}
                    onClick={() => handleRowClick(s.id)}
                  >
                    <td style={styles.td}>
                      <span style={styles.ticket}>{s.numero_ticket}</span>
                    </td>
                    <td style={styles.td}>{s.tipo_nombre || s.tipo_solicitud_id}</td>
                    <td style={styles.td}>{s.titulo}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: (urgenciaColor[s.urgencia] || '#94a3b8') + '22',
                          color: urgenciaColor[s.urgencia] || '#94a3b8',
                          border: `1px solid ${(urgenciaColor[s.urgencia] || '#94a3b8')}44`,
                        }}
                      >
                        {s.urgencia}
                      </span>
                    </td>
                    <td style={styles.td}>{s.solicitante}</td>
                    <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                      <select
                        value={s.estado}
                        onChange={(e) => handleEstadoChange(e, s.id)}
                        style={{
                          ...styles.estadoSelect,
                          color: estadoColor[s.estado] || '#374151',
                        }}
                      >
                        {ESTADOS.map((est) => (
                          <option key={est} value={est}>
                            {est}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.td}>
                      {s.fecha_creacion
                        ? new Date(s.fecha_creacion).toLocaleDateString('es-CO')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  newBtn: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  filters: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  filterItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  filterLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  filterSelect: {
    padding: '7px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.9rem',
    outline: 'none',
  },
  refreshBtn: {
    padding: '7px 14px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    alignSelf: 'flex-end',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  thead: {
    backgroundColor: '#f8fafc',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#475569',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: {
    cursor: 'pointer',
    transition: 'background 0.15s',
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 16px',
    color: '#1e293b',
    verticalAlign: 'middle',
  },
  ticket: {
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    backgroundColor: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '4px',
    color: '#334155',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  estadoSelect: {
    padding: '5px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer',
    background: '#fff',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8',
    fontSize: '0.95rem',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  errorBox: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    marginBottom: '16px',
  },
}

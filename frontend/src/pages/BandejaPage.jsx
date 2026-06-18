import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import solicitudesApi from '../api/solicitudesApi';
import { StatusBadge, UrgencyBadge } from '../components/Badge';
import { ErrorMessage } from '../components/ErrorMessage';
import { SuccessMessage } from '../components/SuccessMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import './BandejaPage.css';

const METRICS_POLL_INTERVAL = 30000; // 30 seconds

// ── Metrics Dashboard ─────────────────────────────────────────────────────────
const ESTADO_LABELS = {
  Recibida: { label: 'Recibidas', color: '#1565c0', bg: '#e3f2fd', icon: '📥' },
  'En revisión': { label: 'En Revisión', color: '#e65100', bg: '#fff3e0', icon: '🔍' },
  Resuelta: { label: 'Resueltas', color: '#2e7d32', bg: '#e8f5e9', icon: '✅' },
  Rechazada: { label: 'Rechazadas', color: '#c62828', bg: '#ffebee', icon: '❌' },
  Cancelada: { label: 'Canceladas', color: '#6a1b9a', bg: '#f3e5f5', icon: '🚫' },
};

const URGENCIA_LABELS = {
  Alta: { label: 'Alta', color: '#b71c1c', bg: '#ffcdd2', icon: '🔴' },
  Media: { label: 'Media', color: '#f57f17', bg: '#fff9c4', icon: '🟡' },
  Baja: { label: 'Baja', color: '#1b5e20', bg: '#c8e6c9', icon: '🟢' },
};

const MetricCard = ({ icon, label, value, color, bg, pulse }) => (
  <div className={`metric-card${pulse ? ' metric-card--alert' : ''}`} style={{ borderColor: color, background: bg }}>
    <span className="metric-card__icon">{icon}</span>
    <span className="metric-card__value" style={{ color }}>{value ?? 0}</span>
    <span className="metric-card__label" style={{ color }}>{label}</span>
  </div>
);

const MetricsDashboard = ({ metricas, loading }) => {
  if (loading && !metricas) {
    return <div className="metrics-loading">Cargando métricas…</div>;
  }
  if (!metricas) return null;

  const alertaCount = metricas.alertasAltaSinMover ?? 0;

  return (
    <div className="metrics-dashboard">
      <div className="metrics-section">
        <h3 className="metrics-section__title">📊 Por Estado</h3>
        <div className="metrics-cards">
          {Object.entries(ESTADO_LABELS).map(([key, meta]) => {
            const row = metricas.porEstado?.find((r) => r.estado === key);
            return (
              <MetricCard
                key={key}
                icon={meta.icon}
                label={meta.label}
                value={row?.total ?? 0}
                color={meta.color}
                bg={meta.bg}
              />
            );
          })}
        </div>
      </div>

      <div className="metrics-section">
        <h3 className="metrics-section__title">⚡ Por Urgencia</h3>
        <div className="metrics-cards">
          {Object.entries(URGENCIA_LABELS).map(([key, meta]) => {
            const row = metricas.porUrgencia?.find((r) => r.urgencia === key);
            return (
              <MetricCard
                key={key}
                icon={meta.icon}
                label={meta.label}
                value={row?.total ?? 0}
                color={meta.color}
                bg={meta.bg}
              />
            );
          })}
        </div>
      </div>

      {alertaCount > 0 && (
        <div className="metrics-alert-banner">
          <span className="metrics-alert-banner__icon">🚨</span>
          <span className="metrics-alert-banner__text">
            <strong>{alertaCount}</strong> solicitud{alertaCount !== 1 ? 'es' : ''} de urgencia{' '}
            <strong>Alta</strong> llevan más de 24h sin moverse del estado{' '}
            <strong>Recibida</strong>.
          </span>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const BandejaPage = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tipos, setTipos] = useState([]);
  const [filters, setFilters] = useState({
    tipo_solicitud_id: '',
    urgencia: '',
  });
  const [statusChanging, setStatusChanging] = useState({});
  const [assigneeModal, setAssigneeModal] = useState({ solicitud_id: null, assignee: '' });

  // Metrics state
  const [metricas, setMetricas] = useState(null);
  const [metricasLoading, setMetricasLoading] = useState(true);
  const metricasIntervalRef = useRef(null);

  // Load solicitudes and catalogs on mount
  useEffect(() => {
    loadSolicitudes();
    loadTipos();
  }, []);

  // Load solicitudes when filters change
  useEffect(() => {
    loadSolicitudes();
  }, [filters]);

  // Load metrics on mount and set up polling
  useEffect(() => {
    loadMetricas();
    metricasIntervalRef.current = setInterval(loadMetricas, METRICS_POLL_INTERVAL);
    return () => clearInterval(metricasIntervalRef.current);
  }, []);

  const loadSolicitudes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await solicitudesApi.getSolicitudes(filters);
      setSolicitudes(response.data || []);
    } catch (err) {
      setError('Error cargando solicitudes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTipos = async () => {
    try {
      const response = await solicitudesApi.getTiposSolicitud();
      setTipos(response.data || []);
    } catch (err) {
      console.error('Error loading tipos:', err);
    }
  };

  const loadMetricas = async () => {
    try {
      const response = await solicitudesApi.getMetricas();
      setMetricas(response.data || null);
    } catch (err) {
      console.error('Error loading metricas:', err);
    } finally {
      setMetricasLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ tipo_solicitud_id: '', urgencia: '' });
  };

  const handleStatusChange = (solicitudId) => {
    const solicitud = solicitudes.find((s) => s.id === solicitudId);
    if (!solicitud) return;

    let newStatus;
    if (solicitud.estado === 'Recibida') {
      newStatus = 'En revisión';
    } else if (solicitud.estado === 'En revisión') {
      newStatus = 'Resuelta';
    } else {
      return;
    }

    if (newStatus === 'En revisión') {
      setAssigneeModal({ solicitud_id: solicitudId, assignee: '' });
    } else {
      submitStatusChange(solicitudId, newStatus, null);
    }
  };

  const submitStatusChange = async (solicitudId, newStatus, assignee) => {
    setStatusChanging((prev) => ({ ...prev, [solicitudId]: true }));
    setError('');

    try {
      await solicitudesApi.changeStatus(solicitudId, newStatus, assignee);
      setSuccess(`Estado actualizado a: ${newStatus}`);
      setAssigneeModal({ solicitud_id: null, assignee: '' });
      await Promise.all([loadSolicitudes(), loadMetricas()]);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al cambiar estado');
    } finally {
      setStatusChanging((prev) => ({ ...prev, [solicitudId]: false }));
    }
  };

  const handleAssigneeSubmit = (e) => {
    e.preventDefault();
    submitStatusChange(assigneeModal.solicitud_id, 'En revisión', assigneeModal.assignee || null);
  };

  const getActionButton = (solicitud) => {
    if (solicitud.estado === 'Recibida') return 'Iniciar Revisión';
    if (solicitud.estado === 'En revisión') return 'Marcar Resuelta';
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const truncateText = (text, length = 80) => {
    if (!text) return '-';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  if (loading && solicitudes.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bandeja-container">
      <div className="bandeja-header">
        <h1>Bandeja de Solicitudes</h1>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess('')} />}

      {/* Metrics Dashboard */}
      <MetricsDashboard metricas={metricas} loading={metricasLoading} />

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="tipo_solicitud_id">Tipo de Solicitud</label>
          <select
            id="tipo_solicitud_id"
            name="tipo_solicitud_id"
            value={filters.tipo_solicitud_id}
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="urgencia">Urgencia</label>
          <select
            id="urgencia"
            name="urgencia"
            value={filters.urgencia}
            onChange={handleFilterChange}
          >
            <option value="">Todas</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </select>
        </div>

        <button onClick={handleClearFilters} className="btn-clear-filters">
          Limpiar Filtros
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {solicitudes.length === 0 ? (
          <div className="empty-state">
            <p>No hay solicitudes que coincidan con los filtros.</p>
          </div>
        ) : (
          <table className="solicitudes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ticket</th>
                <th>Tipo</th>
                <th>Urgencia</th>
                <th>Descripción</th>
                <th>Solicitante</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr
                  key={solicitud.id}
                  className={solicitud.alertaRiesgo ? 'row-risk-alert' : ''}
                >
                  <td>
                    {solicitud.alertaRiesgo && (
                      <span className="risk-indicator" title="Alta urgencia sin mover hace más de 24h">
                        🚨
                      </span>
                    )}
                    {solicitud.id}
                  </td>
                  <td className="ticket-cell">{solicitud.numeroTicket}</td>
                  <td>{solicitud.tipoSolicitudNombre || 'N/A'}</td>
                  <td>
                    <UrgencyBadge urgencia={solicitud.urgencia} />
                  </td>
                  <td
                    className="description-cell"
                    onClick={() => navigate(`/solicitudes/${solicitud.id}`)}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {truncateText(solicitud.descripcion)}
                  </td>
                  <td>{solicitud.solicitante}</td>
                  <td>
                    <StatusBadge status={solicitud.estado} />
                  </td>
                  <td>{solicitud.asignadoA || '-'}</td>
                  <td>{formatDate(solicitud.fechaCreacion)}</td>
                  <td className="actions-cell">
                    {getActionButton(solicitud) ? (
                      <button
                        onClick={() => handleStatusChange(solicitud.id)}
                        disabled={statusChanging[solicitud.id]}
                        className="btn-action"
                      >
                        {statusChanging[solicitud.id] ? '...' : getActionButton(solicitud)}
                      </button>
                    ) : (
                      <span className="no-action">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assignee Modal */}
      {assigneeModal.solicitud_id && (
        <div
          className="modal-overlay"
          onClick={() => setAssigneeModal({ solicitud_id: null, assignee: '' })}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Asignar Responsable</h2>
            <form onSubmit={handleAssigneeSubmit}>
              <div className="form-group">
                <label htmlFor="assignee">Nombre del Responsable (opcional)</label>
                <input
                  type="text"
                  id="assignee"
                  value={assigneeModal.assignee}
                  onChange={(e) =>
                    setAssigneeModal((prev) => ({ ...prev, assignee: e.target.value }))
                  }
                  placeholder="Nombre de la persona responsable"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-submit">
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setAssigneeModal({ solicitud_id: null, assignee: '' })}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

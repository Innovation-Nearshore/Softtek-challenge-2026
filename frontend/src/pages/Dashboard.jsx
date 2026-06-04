import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { initiativesService } from '../services/api';
import StatusModal from '../components/StatusModal';
import './Dashboard.css';

const VALID_STATUSES = ['Pendiente', 'En curso', 'Completado'];

function getStatusClass(estado) {
  if (!estado) return '';
  const map = {
    'Pendiente': 'badge--pendiente',
    'En curso': 'badge--en-curso',
    'Completado': 'badge--completado',
  };
  return map[estado] || '';
}

function getPriorityClass(prioridad) {
  if (!prioridad) return '';
  const map = {
    'Alta': 'priority--alta',
    'Media': 'priority--media',
    'Baja': 'priority--baja',
  };
  return map[prioridad] || '';
}

function getPriorityDot(prioridad) {
  const map = {
    'Alta': '🔴',
    'Media': '🟡',
    'Baja': '🟢',
  };
  return map[prioridad] || '⚪';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function Dashboard() {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, initiative: null });
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(new Set(VALID_STATUSES));

  const fetchInitiatives = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await initiativesService.getAll();
      setInitiatives(res.data || []);
    } catch (err) {
      setError('No se pudo cargar la lista de iniciativas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitiatives();
  }, [fetchInitiatives]);

  const handleStatusUpdated = (updatedInitiative) => {
    setInitiatives((prev) =>
      prev.map((i) => (i.id === updatedInitiative.id ? updatedInitiative : i))
    );
    setStatusModal({ open: false, initiative: null });
    showSuccess('Estado actualizado correctamente');
  };

  const handleDeleteClick = (initiative) => {
    setDeleteConfirm(initiative);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      await initiativesService.delete(deleteConfirm.id);
      setInitiatives((prev) => prev.filter((i) => i.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      showSuccess('Iniciativa eliminada correctamente');
    } catch {
      setDeleteConfirm(null);
      setError('No se pudo eliminar la iniciativa. Por favor, intenta de nuevo.');
    } finally {
      setDeleting(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const toggleStatusFilter = (status) => {
    setSelectedStatuses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  const filteredInitiatives = initiatives.filter((init) =>
    selectedStatuses.has(init.estado)
  );

  return (
    <div className="dashboard">
      {/* Page Header */}
      <div className="page-header dashboard__header">
        <div>
          <h1 className="page-header__title">Panel de Iniciativas</h1>
          <p className="page-header__subtitle">
            Gestiona y realiza seguimiento de todos los proyectos del área
          </p>
        </div>
        <Link to="/nueva" className="btn btn--primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Iniciativa
        </Link>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="alert alert--success dashboard__alert" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error dashboard__alert" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <span>{error}</span>
            <button className="dashboard__retry-btn" onClick={fetchInitiatives}>
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="dashboard__loading" aria-label="Cargando iniciativas">
          <div className="spinner spinner--dark"></div>
          <span>Cargando iniciativas...</span>
        </div>
      )}

      {/* Empty State (No initiatives at all) */}
      {!loading && !error && initiatives.length === 0 && (
        <div className="dashboard__empty" role="status">
          <div className="empty-state">
            <div className="empty-state__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
            </div>
            <h2 className="empty-state__title">No hay iniciativas disponibles para mostrar</h2>
            <p className="empty-state__description">
              Aún no se han registrado iniciativas. Crea la primera iniciativa para comenzar
              el seguimiento de los proyectos del área.
            </p>
            <Link to="/nueva" className="btn btn--primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Crear primera iniciativa
            </Link>
          </div>
        </div>
      )}

      {/* State Filter */}
      {!loading && !error && initiatives.length > 0 && (
        <div className="dashboard__filter-section">
          <div className="status-filter">
            <label className="status-filter__label">Filtrar por estado:</label>
            <div className="status-filter__options">
              {VALID_STATUSES.map((status) => (
                <label key={status} className="status-filter__option">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.has(status)}
                    onChange={() => toggleStatusFilter(status)}
                    className="status-filter__checkbox"
                  />
                  <span className="status-filter__text">{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Initiatives Table */}
      {!loading && !error && initiatives.length > 0 && (
        <>
          <div className="dashboard__count">
            <span>
              {filteredInitiatives.length} de {initiatives.length} iniciativa{initiatives.length !== 1 ? 's' : ''} registrada{initiatives.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Empty State (No initiatives match filter) */}
          {filteredInitiatives.length === 0 && (
            <div className="dashboard__empty" role="status">
              <div className="empty-state">
                <div className="empty-state__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <path d="M9 12h6M9 16h4" />
                  </svg>
                </div>
                <h2 className="empty-state__title">No hay iniciativas con el filtro aplicado</h2>
                <p className="empty-state__description">
                  Intenta modificar los estados seleccionados para ver más iniciativas.
                </p>
              </div>
            </div>
          )}

          {/* Desktop Table */}
          {filteredInitiatives.length > 0 && (
            <div className="table-wrapper">
              <table className="initiatives-table" aria-label="Lista de iniciativas">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Responsable</th>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Fecha Límite</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInitiatives.map((initiative) => (
                    <tr key={initiative.id} className="initiatives-table__row">
                      <td className="initiatives-table__name">
                        <div className="initiative-name">{initiative.nombre}</div>
                        {initiative.descripcion && (
                          <div className="initiative-desc">{initiative.descripcion}</div>
                        )}
                      </td>
                      <td>
                        <div className="initiative-responsible">
                          <div className="responsible-avatar">
                            {initiative.responsable?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span>{initiative.responsable}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusClass(initiative.estado)}`}>
                          {initiative.estado}
                        </span>
                      </td>
                      <td>
                        <span className={`priority ${getPriorityClass(initiative.prioridad)}`}>
                          {getPriorityDot(initiative.prioridad)} {initiative.prioridad}
                        </span>
                      </td>
                      <td className="initiatives-table__date">
                        {formatDate(initiative.fecha_limite)}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn--sm btn--secondary"
                            onClick={() => setStatusModal({ open: true, initiative })}
                            title="Actualizar estado"
                            aria-label={`Actualizar estado de ${initiative.nombre}`}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="23 4 23 10 17 10" />
                              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            Estado
                          </button>
                          <Link
                            to={`/editar/${initiative.id}`}
                            className="btn btn--sm btn--secondary"
                            title="Editar iniciativa"
                            aria-label={`Editar ${initiative.nombre}`}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Editar
                          </Link>
                          <button
                            className="btn btn--sm btn--danger"
                            onClick={() => handleDeleteClick(initiative)}
                            title="Eliminar iniciativa"
                            aria-label={`Eliminar ${initiative.nombre}`}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Card List */}
          {filteredInitiatives.length > 0 && (
            <div className="initiative-cards">
              {filteredInitiatives.map((initiative) => (
                <div key={initiative.id} className="initiative-card card">
                  <div className="initiative-card__header">
                    <h3 className="initiative-card__title">{initiative.nombre}</h3>
                    <span className={`badge ${getStatusClass(initiative.estado)}`}>
                      {initiative.estado}
                    </span>
                  </div>
                  {initiative.descripcion && (
                    <p className="initiative-card__desc">{initiative.descripcion}</p>
                  )}
                  <div className="initiative-card__meta">
                    <div className="meta-item">
                      <span className="meta-label">Responsable</span>
                      <span className="meta-value">{initiative.responsable}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Prioridad</span>
                      <span className={`priority ${getPriorityClass(initiative.prioridad)}`}>
                        {getPriorityDot(initiative.prioridad)} {initiative.prioridad}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Fecha Límite</span>
                      <span className="meta-value">{formatDate(initiative.fecha_limite)}</span>
                    </div>
                  </div>
                  <div className="initiative-card__actions">
                    <button
                      className="btn btn--sm btn--secondary"
                      onClick={() => setStatusModal({ open: true, initiative })}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      Estado
                    </button>
                    <Link to={`/editar/${initiative.id}`} className="btn btn--sm btn--secondary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Editar
                    </Link>
                    <button
                      className="btn btn--sm btn--danger"
                      onClick={() => handleDeleteClick(initiative)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Status Update Modal */}
      {statusModal.open && (
        <StatusModal
          initiative={statusModal.initiative}
          onClose={() => setStatusModal({ open: false, initiative: null })}
          onUpdated={handleStatusUpdated}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="modal modal--sm">
            <div className="modal__header">
              <h2 id="delete-title" className="modal__title">Eliminar Iniciativa</h2>
            </div>
            <div className="modal__body">
              <p>¿Estás seguro de que deseas eliminar la iniciativa <strong>"{deleteConfirm.nombre}"</strong>?</p>
              <p className="modal__warning">Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal__footer">
              <button
                className="btn btn--secondary"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className="btn btn--danger"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="spinner"></span>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                    </svg>
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

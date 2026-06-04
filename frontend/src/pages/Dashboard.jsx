import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { initiativesService } from '../services/api';
import StatusModal from '../components/StatusModal';
import './Dashboard.css';

const VALID_STATUSES = ['Pendiente', 'En curso', 'Completado'];
const VALID_PRIORITIES = ['Alta', 'Media', 'Baja'];
const TABS = [
  { id: 'lista',       label: 'Lista',                icon: 'list' },
  { id: 'vencimientos', label: 'Vencimientos',         icon: 'clock' },
  { id: 'kanban',      label: 'Kanban',               icon: 'kanban' },
];

/* ── Pure helpers ─────────────────────────────────── */
function getStatusClass(estado) {
  const map = { 'Pendiente': 'badge--pendiente', 'En curso': 'badge--en-curso', 'Completado': 'badge--completado' };
  return map[estado] || '';
}
function getStatusColumnClass(estado) {
  const map = { 'Pendiente': 'kanban-col--pendiente', 'En curso': 'kanban-col--en-curso', 'Completado': 'kanban-col--completado' };
  return map[estado] || '';
}
function getPriorityClass(prioridad) {
  const map = { 'Alta': 'priority--alta', 'Media': 'priority--media', 'Baja': 'priority--baja' };
  return map[prioridad] || '';
}
function getPriorityDot(prioridad) {
  return { 'Alta': '🔴', 'Media': '🟡', 'Baja': '🟢' }[prioridad] || '⚪';
}
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dl = new Date(dateStr); dl.setHours(0, 0, 0, 0);
  return Math.round((dl - today) / 86400000);
}
function getDeadlineUrgencyClass(dateStr) {
  const d = daysUntil(dateStr);
  if (d === null) return '';
  if (d < 0) return 'deadline--overdue';
  if (d === 0) return 'deadline--today';
  if (d <= 3) return 'deadline--urgent';
  return 'deadline--soon';
}
function getDeadlineLabel(dateStr) {
  const d = daysUntil(dateStr);
  if (d === null) return '';
  if (d < 0) return `Vencida hace ${Math.abs(d)} día${Math.abs(d) !== 1 ? 's' : ''}`;
  if (d === 0) return 'Vence hoy';
  if (d === 1) return 'Vence mañana';
  return `Vence en ${d} días`;
}

/* ── Tab icon SVGs ────────────────────────────────── */
function TabIcon({ type }) {
  if (type === 'list') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
  if (type === 'clock') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="4" height="15" rx="1"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════ */
function Dashboard() {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, initiative: null });
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(new Set(VALID_STATUSES));
  const [selectedPriorities, setSelectedPriorities] = useState(new Set(VALID_PRIORITIES));
  const [activeTab, setActiveTab] = useState('lista');

  // Drag-and-drop state
  const dragId = useRef(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  /* ── Data fetching ── */
  const fetchInitiatives = useCallback(async () => {
    try { setLoading(true); setError(null);
      const res = await initiativesService.getAll();
      setInitiatives(res.data || []);
    } catch { setError('No se pudo cargar la lista de iniciativas. Por favor, intenta de nuevo.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInitiatives(); }, [fetchInitiatives]);

  /* ── Handlers ── */
  const handleStatusUpdated = (updated) => {
    setInitiatives(prev => prev.map(i => i.id === updated.id ? updated : i));
    setStatusModal({ open: false, initiative: null });
    showSuccess('Estado actualizado correctamente');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      await initiativesService.delete(deleteConfirm.id);
      setInitiatives(prev => prev.filter(i => i.id !== deleteConfirm.id));
      setDeleteConfirm(null); showSuccess('Iniciativa eliminada correctamente');
    } catch { setDeleteConfirm(null); setError('No se pudo eliminar la iniciativa.'); }
    finally { setDeleting(false); }
  };

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };

  const toggleStatusFilter = (s) => setSelectedStatuses(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  const togglePriorityFilter = (p) => setSelectedPriorities(prev => { const n = new Set(prev); n.has(p) ? n.delete(p) : n.add(p); return n; });

  /* ── Derived data ── */
  const filteredInitiatives = useMemo(() =>
    initiatives.filter(i => selectedStatuses.has(i.estado) && selectedPriorities.has(i.prioridad)),
    [initiatives, selectedStatuses, selectedPriorities]
  );

  const upcomingDeadlines = useMemo(() =>
    initiatives.filter(i => i.estado !== 'Completado' && daysUntil(i.fecha_limite) !== null && daysUntil(i.fecha_limite) <= 7)
      .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite)),
    [initiatives]
  );

  const kanbanColumns = useMemo(() =>
    VALID_STATUSES.reduce((acc, s) => { acc[s] = initiatives.filter(i => i.estado === s); return acc; }, {}),
    [initiatives]
  );

  /* ── Kanban drag-and-drop ── */
  const handleDragStart = (e, initiative) => {
    dragId.current = initiative.id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colStatus);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = dragId.current;
    if (!id) return;
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative || initiative.estado === newStatus) return;

    // Optimistic update
    setInitiatives(prev => prev.map(i => i.id === id ? { ...i, estado: newStatus } : i));
    try {
      const res = await initiativesService.updateStatus(id, newStatus);
      const updated = res.data?.initiative || res.data;
      setInitiatives(prev => prev.map(i => i.id === id ? updated : i));
      showSuccess(`"${initiative.nombre}" movida a ${newStatus}`);
    } catch {
      // Revert on failure
      setInitiatives(prev => prev.map(i => i.id === id ? initiative : i));
      setError('No se pudo actualizar el estado. Por favor, intenta de nuevo.');
    }
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCol(null);
  };

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <div className="page-header dashboard__header">
        <div>
          <h1 className="page-header__title">Panel de Iniciativas</h1>
          <p className="page-header__subtitle">Gestiona y realiza seguimiento de todos los proyectos del área</p>
        </div>
        <Link to="/nueva" className="btn btn--primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Iniciativa
        </Link>
      </div>

      {/* ── Alerts ── */}
      {successMsg && (
        <div className="alert alert--success dashboard__alert" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="alert alert--error dashboard__alert" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div><span>{error}</span>
            <button className="dashboard__retry-btn" onClick={fetchInitiatives}>Reintentar</button>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="dashboard__loading">
          <div className="spinner spinner--dark"></div><span>Cargando iniciativas...</span>
        </div>
      )}

      {/* ── Empty (sin ninguna iniciativa) ── */}
      {!loading && !error && initiatives.length === 0 && (
        <div className="dashboard__empty" role="status">
          <div className="empty-state">
            <div className="empty-state__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" />
              </svg>
            </div>
            <h2 className="empty-state__title">No hay iniciativas disponibles para mostrar</h2>
            <p className="empty-state__description">Aún no se han registrado iniciativas. Crea la primera para comenzar.</p>
            <Link to="/nueva" className="btn btn--primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Crear primera iniciativa
            </Link>
          </div>
        </div>
      )}

      {/* ── Main content (tabs) ── */}
      {!loading && !error && initiatives.length > 0 && (
        <>
          {/* ── Tab nav ── */}
          <div className="dashboard-tabs" role="tablist" aria-label="Vistas de iniciativas">
            {TABS.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                className={`dashboard-tab ${activeTab === tab.id ? 'dashboard-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon type={tab.icon} />
                {tab.label}
                {tab.id === 'vencimientos' && upcomingDeadlines.length > 0 && (
                  <span className="tab-badge">{upcomingDeadlines.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* ══════════════════════
              TAB: LISTA
          ══════════════════════ */}
          {activeTab === 'lista' && (
            <div id="tabpanel-lista" role="tabpanel" aria-labelledby="tab-lista">
              {/* Filters */}
              <div className="dashboard__filter-section">
                <div className="filters-bar">
                  <div className="filter-group">
                    <span className="filter-group__label">Estado:</span>
                    <div className="filter-group__options">
                      {VALID_STATUSES.map(s => (
                        <label key={s} className="filter-option">
                          <input type="checkbox" checked={selectedStatuses.has(s)} onChange={() => toggleStatusFilter(s)} className="filter-option__checkbox" />
                          <span className="filter-option__text">{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="filters-bar__divider" />
                  <div className="filter-group">
                    <span className="filter-group__label">Prioridad:</span>
                    <div className="filter-group__options">
                      {VALID_PRIORITIES.map(p => (
                        <label key={p} className="filter-option">
                          <input type="checkbox" checked={selectedPriorities.has(p)} onChange={() => togglePriorityFilter(p)} className="filter-option__checkbox" />
                          <span className={`filter-option__text filter-priority--${p.toLowerCase()}`}>{getPriorityDot(p)} {p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard__count">
                {filteredInitiatives.length} de {initiatives.length} iniciativa{initiatives.length !== 1 ? 's' : ''} registrada{initiatives.length !== 1 ? 's' : ''}
              </div>

              {filteredInitiatives.length === 0 && (
                <div className="dashboard__empty" role="status">
                  <div className="empty-state">
                    <div className="empty-state__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" />
                      </svg>
                    </div>
                    <h2 className="empty-state__title">No hay iniciativas con los filtros aplicados</h2>
                    <p className="empty-state__description">Intenta modificar los estados o prioridades seleccionados.</p>
                  </div>
                </div>
              )}

              {filteredInitiatives.length > 0 && (
                <>
                  {/* Desktop table */}
                  <div className="table-wrapper">
                    <table className="initiatives-table" aria-label="Lista de iniciativas">
                      <thead>
                        <tr><th>Nombre</th><th>Responsable</th><th>Estado</th><th>Prioridad</th><th>Fecha Límite</th><th>Acciones</th></tr>
                      </thead>
                      <tbody>
                        {filteredInitiatives.map(initiative => (
                          <tr key={initiative.id} className="initiatives-table__row">
                            <td className="initiatives-table__name">
                              <div className="initiative-name">{initiative.nombre}</div>
                              {initiative.descripcion && <div className="initiative-desc">{initiative.descripcion}</div>}
                            </td>
                            <td>
                              <div className="initiative-responsible">
                                <div className="responsible-avatar">{initiative.responsable?.charAt(0)?.toUpperCase() || '?'}</div>
                                <span>{initiative.responsable}</span>
                              </div>
                            </td>
                            <td><span className={`badge ${getStatusClass(initiative.estado)}`}>{initiative.estado}</span></td>
                            <td><span className={`priority ${getPriorityClass(initiative.prioridad)}`}>{getPriorityDot(initiative.prioridad)} {initiative.prioridad}</span></td>
                            <td className="initiatives-table__date">
                              {formatDate(initiative.fecha_limite)}
                              {initiative.estado !== 'Completado' && (() => { const d = daysUntil(initiative.fecha_limite); return d !== null && d <= 7 ? <span className={`deadline-tag ${getDeadlineUrgencyClass(initiative.fecha_limite)}`}>{getDeadlineLabel(initiative.fecha_limite)}</span> : null; })()}
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button className="btn btn--sm btn--secondary" onClick={() => setStatusModal({ open: true, initiative })} aria-label={`Estado de ${initiative.nombre}`}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                                  Estado
                                </button>
                                <Link to={`/editar/${initiative.id}`} className="btn btn--sm btn--secondary" aria-label={`Editar ${initiative.nombre}`}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                  Editar
                                </Link>
                                <button className="btn btn--sm btn--danger" onClick={() => setDeleteConfirm(initiative)} aria-label={`Eliminar ${initiative.nombre}`}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="initiative-cards">
                    {filteredInitiatives.map(initiative => (
                      <div key={initiative.id} className="initiative-card card">
                        <div className="initiative-card__header">
                          <h3 className="initiative-card__title">{initiative.nombre}</h3>
                          <span className={`badge ${getStatusClass(initiative.estado)}`}>{initiative.estado}</span>
                        </div>
                        {initiative.descripcion && <p className="initiative-card__desc">{initiative.descripcion}</p>}
                        <div className="initiative-card__meta">
                          <div className="meta-item"><span className="meta-label">Responsable</span><span className="meta-value">{initiative.responsable}</span></div>
                          <div className="meta-item"><span className="meta-label">Prioridad</span><span className={`priority ${getPriorityClass(initiative.prioridad)}`}>{getPriorityDot(initiative.prioridad)} {initiative.prioridad}</span></div>
                          <div className="meta-item"><span className="meta-label">Fecha Límite</span>
                            <span className="meta-value">
                              {formatDate(initiative.fecha_limite)}
                              {initiative.estado !== 'Completado' && (() => { const d = daysUntil(initiative.fecha_limite); return d !== null && d <= 7 ? <span className={`deadline-tag ${getDeadlineUrgencyClass(initiative.fecha_limite)}`}>{getDeadlineLabel(initiative.fecha_limite)}</span> : null; })()}
                            </span>
                          </div>
                        </div>
                        <div className="initiative-card__actions">
                          <button className="btn btn--sm btn--secondary" onClick={() => setStatusModal({ open: true, initiative })}>Estado</button>
                          <Link to={`/editar/${initiative.id}`} className="btn btn--sm btn--secondary">Editar</Link>
                          <button className="btn btn--sm btn--danger" onClick={() => setDeleteConfirm(initiative)}>Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════
              TAB: VENCIMIENTOS
          ══════════════════════ */}
          {activeTab === 'vencimientos' && (
            <div id="tabpanel-vencimientos" role="tabpanel" aria-labelledby="tab-vencimientos">
              <div className="upcoming-tab-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p>Iniciativas no completadas con fecha límite en los próximos 7 días</p>
              </div>

              {upcomingDeadlines.length === 0 ? (
                <div className="dashboard__empty" role="status">
                  <div className="empty-state">
                    <div className="empty-state__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <h2 className="empty-state__title">Sin vencimientos próximos</h2>
                    <p className="empty-state__description">No hay iniciativas próximas a vencer en los siguientes 7 días.</p>
                  </div>
                </div>
              ) : (
                <div className="upcoming-panel">
                  {upcomingDeadlines.map(init => (
                    <div key={init.id} className={`upcoming-item ${getDeadlineUrgencyClass(init.fecha_limite)}`}>
                      <div className="upcoming-item__left">
                        <span className={`upcoming-item__urgency-badge ${getDeadlineUrgencyClass(init.fecha_limite)}`}>{getDeadlineLabel(init.fecha_limite)}</span>
                        <span className="upcoming-item__name">{init.nombre}</span>
                      </div>
                      <div className="upcoming-item__right">
                        <span className="upcoming-item__date">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                          {formatDate(init.fecha_limite)}
                        </span>
                        <span className={`badge ${getStatusClass(init.estado)}`}>{init.estado}</span>
                        <span className={`priority ${getPriorityClass(init.prioridad)}`}>{getPriorityDot(init.prioridad)} {init.prioridad}</span>
                        <div className="upcoming-item__actions">
                          <button className="btn btn--sm btn--secondary" onClick={() => setStatusModal({ open: true, initiative: init })} aria-label={`Estado de ${init.nombre}`}>Estado</button>
                          <Link to={`/editar/${init.id}`} className="btn btn--sm btn--secondary" aria-label={`Editar ${init.nombre}`}>Editar</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════
              TAB: KANBAN
          ══════════════════════ */}
          {activeTab === 'kanban' && (
            <div id="tabpanel-kanban" role="tabpanel" aria-labelledby="tab-kanban">
              <p className="kanban-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 9l4 4 10-10"/><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h9"/></svg>
                Arrastra las tarjetas entre columnas para cambiar su estado
              </p>
              <div className="kanban-board">
                {VALID_STATUSES.map(colStatus => {
                  const colCards = kanbanColumns[colStatus] || [];
                  const isOver = dragOverCol === colStatus;
                  return (
                    <div
                      key={colStatus}
                      className={`kanban-col ${getStatusColumnClass(colStatus)} ${isOver ? 'kanban-col--drag-over' : ''}`}
                      onDragOver={(e) => handleDragOver(e, colStatus)}
                      onDrop={(e) => handleDrop(e, colStatus)}
                      onDragLeave={handleDragLeave}
                      aria-label={`Columna ${colStatus}`}
                    >
                      {/* Column header */}
                      <div className="kanban-col__header">
                        <span className={`badge ${getStatusClass(colStatus)}`}>{colStatus}</span>
                        <span className="kanban-col__count">{colCards.length}</span>
                      </div>

                      {/* Cards */}
                      <div className="kanban-col__cards">
                        {colCards.length === 0 && (
                          <div className="kanban-col__empty">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                              <rect x="9" y="3" width="6" height="4" rx="1"/>
                            </svg>
                            <span>Sin iniciativas</span>
                          </div>
                        )}
                        {colCards.map(initiative => (
                          <div
                            key={initiative.id}
                            className="kanban-card"
                            draggable
                            onDragStart={(e) => handleDragStart(e, initiative)}
                            aria-label={`${initiative.nombre}, arrastrar para mover`}
                          >
                            <div className="kanban-card__drag-handle" aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/>
                                <circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/>
                                <circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/>
                              </svg>
                            </div>

                            <div className="kanban-card__body">
                              <h4 className="kanban-card__title">{initiative.nombre}</h4>
                              {initiative.descripcion && (
                                <p className="kanban-card__desc">{initiative.descripcion}</p>
                              )}
                              <div className="kanban-card__meta">
                                <div className="kanban-card__responsible">
                                  <div className="responsible-avatar responsible-avatar--sm">
                                    {initiative.responsable?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                  <span>{initiative.responsable}</span>
                                </div>
                                <span className={`priority ${getPriorityClass(initiative.prioridad)}`}>
                                  {getPriorityDot(initiative.prioridad)} {initiative.prioridad}
                                </span>
                              </div>
                              <div className="kanban-card__footer">
                                <span className="kanban-card__date">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                  </svg>
                                  {formatDate(initiative.fecha_limite)}
                                </span>
                                {initiative.estado !== 'Completado' && (() => {
                                  const d = daysUntil(initiative.fecha_limite);
                                  return d !== null && d <= 7
                                    ? <span className={`deadline-tag ${getDeadlineUrgencyClass(initiative.fecha_limite)}`}>{getDeadlineLabel(initiative.fecha_limite)}</span>
                                    : null;
                                })()}
                              </div>
                            </div>

                            <div className="kanban-card__actions">
                              <Link to={`/editar/${initiative.id}`} className="btn btn--sm btn--secondary" aria-label={`Editar ${initiative.nombre}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Editar
                              </Link>
                              <button
                                className="btn btn--sm btn--danger"
                                onClick={() => setDeleteConfirm(initiative)}
                                aria-label={`Eliminar ${initiative.nombre}`}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                                </svg>
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Status Modal ── */}
      {statusModal.open && (
        <StatusModal
          initiative={statusModal.initiative}
          onClose={() => setStatusModal({ open: false, initiative: null })}
          onUpdated={handleStatusUpdated}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="modal modal--sm">
            <div className="modal__header">
              <h2 id="delete-title" className="modal__title">Eliminar Iniciativa</h2>
            </div>
            <div className="modal__body">
              <p>¿Estás seguro de que deseas eliminar <strong>"{deleteConfirm.nombre}"</strong>?</p>
              <p className="modal__warning">Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={() => setDeleteConfirm(null)} disabled={deleting}>Cancelar</button>
              <button className="btn btn--danger" onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? <><span className="spinner"></span>Eliminando...</> : <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  </svg>
                  Eliminar
                </>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

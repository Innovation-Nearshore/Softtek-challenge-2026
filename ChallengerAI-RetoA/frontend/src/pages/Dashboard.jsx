import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIniciativas, getStats, deleteIniciativa, updateIniciativa, getProximosVencimientos } from '../services/api';
import { ESTADOS, PRIORIDADES, ESTADO_COLORS, ESTADO_BG, PRIORIDAD_COLORS, PRIORIDAD_BG } from '../utils/constants';
import KanbanBoard from '../components/KanbanBoard';
import './Dashboard.css';

const VIEW_TABLE = 'table';
const VIEW_KANBAN = 'kanban';
const VIEW_UPCOMING = 'upcoming';

export default function Dashboard() {
  const navigate = useNavigate();

  const [iniciativas, setIniciativas] = useState([]);
  const [stats, setStats] = useState({ Pendiente: 0, 'En curso': 0, Completado: 0, total: 0 });
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [view, setView] = useState(VIEW_TABLE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [proximosVencimientos, setProximosVencimientos] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  // Inline editing state: { id, field, value }
  const [inlineEdit, setInlineEdit] = useState(null);
  const [inlineSaving, setInlineSaving] = useState(false);
  const [inlineError, setInlineError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await getStats();
      setStats(data.data || data);
    } catch {
      // stats non-critical, silently fail
    }
  }, []);

  const fetchProximosVencimientos = useCallback(async () => {
    setLoadingUpcoming(true);
    try {
      const { data } = await getProximosVencimientos();
      setProximosVencimientos(data.data || data);
    } catch {
      // non-critical
    } finally {
      setLoadingUpcoming(false);
    }
  }, []);

  const fetchIniciativas = useCallback(async (estado = '', prioridad = '') => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getIniciativas(estado, prioridad);
      setIniciativas(data.data || data);
    } catch {
      setError('No se pudieron cargar las iniciativas. Verifica que el servidor esté en línea.');
    } finally {
      setLoading(false);
    }
  }, []);

  const iniciativasFiltradas = iniciativas;

  useEffect(() => {
    fetchIniciativas(filtroEstado, filtroPrioridad);
    fetchStats();
    fetchProximosVencimientos();
  }, [filtroEstado, filtroPrioridad, fetchIniciativas, fetchStats, fetchProximosVencimientos]);

  const handleDelete = async (id) => {
    try {
      await deleteIniciativa(id);
      setDeleteConfirm(null);
      fetchIniciativas(filtroEstado, filtroPrioridad);
      fetchStats();
    } catch {
      setError('No se pudo eliminar la iniciativa.');
    }
  };

  // ── Drag & Drop: change estado via Kanban ──────────────────────────────────
  const handleStatusChange = async (item, newEstado) => {
    // Optimistic update
    setIniciativas((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, estado: newEstado } : i))
    );
    try {
      await updateIniciativa(item.id, { ...item, estado: newEstado });
      fetchStats();
    } catch {
      // Rollback
      setIniciativas((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, estado: item.estado } : i))
      );
      setError('No se pudo actualizar el estado. Inténtalo de nuevo.');
    }
  };

  // ── Inline editing helpers ─────────────────────────────────────────────────
  const startInlineEdit = (item, field) => {
    setInlineEdit({ id: item.id, field, value: item[field] });
    setInlineError(null);
  };

  const cancelInlineEdit = () => {
    setInlineEdit(null);
    setInlineError(null);
  };

  const confirmInlineEdit = async () => {
    if (!inlineEdit) return;
    const trimmed = inlineEdit.value.trim();
    if (!trimmed) {
      setInlineError('El campo no puede estar vacío.');
      return;
    }
    const item = iniciativas.find((i) => i.id === inlineEdit.id);
    if (!item) return;
    setInlineSaving(true);
    setInlineError(null);
    // Optimistic update
    setIniciativas((prev) =>
      prev.map((i) => (i.id === inlineEdit.id ? { ...i, [inlineEdit.field]: trimmed } : i))
    );
    try {
      await updateIniciativa(inlineEdit.id, { ...item, [inlineEdit.field]: trimmed });
      setInlineEdit(null);
    } catch (err) {
      // Rollback
      setIniciativas((prev) =>
        prev.map((i) => (i.id === inlineEdit.id ? { ...i, [inlineEdit.field]: item[inlineEdit.field] } : i))
      );
      setInlineError(err.response?.data?.message || 'Error al guardar.');
    } finally {
      setInlineSaving(false);
    }
  };

  const handleInlineKeyDown = (e) => {
    if (e.key === 'Enter') confirmInlineEdit();
    if (e.key === 'Escape') cancelInlineEdit();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">📋 Gestión de Iniciativas</h1>
          <p className="dashboard-subtitle">Seguimiento de proyectos e iniciativas del área</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/nueva')}>
          + Nueva Iniciativa
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <span className="stat-label">Total</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        {ESTADOS.map((estado) => (
          <div
            key={estado}
            className="stat-card"
            style={{ background: ESTADO_BG[estado], borderLeft: `4px solid ${ESTADO_COLORS[estado]}` }}
          >
            <span className="stat-label">{estado}</span>
            <span className="stat-value" style={{ color: ESTADO_COLORS[estado] }}>
              {stats[estado] ?? 0}
            </span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="dashboard-controls">
        <div className="filters-wrapper">
          <div className="filter-group">
            <label htmlFor="filtro-estado">Filtrar por Estado:</label>
            <select
              id="filtro-estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filtro-prioridad">Filtrar por Prioridad:</label>
            <select
              id="filtro-prioridad"
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
            >
              <option value="">Todas</option>
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="view-toggle">
          <button
            className={`toggle-btn ${view === VIEW_TABLE ? 'active' : ''}`}
            onClick={() => setView(VIEW_TABLE)}
          >
            📊 Tabla
          </button>
          <button
            className={`toggle-btn ${view === VIEW_KANBAN ? 'active' : ''}`}
            onClick={() => setView(VIEW_KANBAN)}
          >
            🗂 Kanban
          </button>
          <button
            className={`toggle-btn ${view === VIEW_UPCOMING ? 'active' : ''}`}
            onClick={() => setView(VIEW_UPCOMING)}
          >
            ⏰ Próximos vencimientos
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && <div className="error-banner">{error}</div>}

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <span>Cargando iniciativas…</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && iniciativasFiltradas.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>
            {filtroEstado || filtroPrioridad
              ? `Sin resultados para ${[filtroEstado, filtroPrioridad].filter(Boolean).map((f) => `"${f}"`).join(' y ')}`
              : 'Sin iniciativas registradas'}
          </h3>
          <p>
            {filtroEstado || filtroPrioridad
              ? 'Prueba seleccionando otros filtros o limpia la selección.'
              : 'Registra tu primera iniciativa para comenzar el seguimiento.'}
          </p>
          {!filtroEstado && !filtroPrioridad && (
            <button className="btn btn-primary" onClick={() => navigate('/nueva')}>
              ➕ Crear primera iniciativa
            </button>
          )}
        </div>
      )}

      {/* Table View */}
      {!loading && !error && iniciativasFiltradas.length > 0 && view === VIEW_TABLE && (
        <div className="table-wrapper">
          <table className="iniciativas-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha Límite</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {iniciativasFiltradas.map((item) => (
                <tr key={item.id}>
                  {/* Inline-editable: nombre */}
                  <td className="td-nombre">
                    {inlineEdit?.id === item.id && inlineEdit.field === 'nombre' ? (
                      <div className="inline-edit-cell">
                        <input
                          className="inline-input"
                          value={inlineEdit.value}
                          autoFocus
                          onChange={(e) => setInlineEdit((p) => ({ ...p, value: e.target.value }))}
                          onKeyDown={handleInlineKeyDown}
                          disabled={inlineSaving}
                        />
                        <button className="inline-btn inline-btn--save" title="Guardar" onClick={confirmInlineEdit} disabled={inlineSaving}>✔</button>
                        <button className="inline-btn inline-btn--cancel" title="Cancelar" onClick={cancelInlineEdit} disabled={inlineSaving}>✖</button>
                        {inlineError && <span className="inline-error">{inlineError}</span>}
                      </div>
                    ) : (
                      <span className="inline-editable" title="Doble clic para editar" onDoubleClick={() => startInlineEdit(item, 'nombre')}>
                        {item.nombre}
                        <span className="inline-edit-hint">✎</span>
                      </span>
                    )}
                  </td>
                  {/* Inline-editable: responsable */}
                  <td>
                    {inlineEdit?.id === item.id && inlineEdit.field === 'responsable' ? (
                      <div className="inline-edit-cell">
                        <input
                          className="inline-input"
                          value={inlineEdit.value}
                          autoFocus
                          onChange={(e) => setInlineEdit((p) => ({ ...p, value: e.target.value }))}
                          onKeyDown={handleInlineKeyDown}
                          disabled={inlineSaving}
                        />
                        <button className="inline-btn inline-btn--save" title="Guardar" onClick={confirmInlineEdit} disabled={inlineSaving}>✔</button>
                        <button className="inline-btn inline-btn--cancel" title="Cancelar" onClick={cancelInlineEdit} disabled={inlineSaving}>✖</button>
                        {inlineError && <span className="inline-error">{inlineError}</span>}
                      </div>
                    ) : (
                      <span className="inline-editable" title="Doble clic para editar" onDoubleClick={() => startInlineEdit(item, 'responsable')}>
                        {item.responsable}
                        <span className="inline-edit-hint">✎</span>
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: ESTADO_BG[item.estado] || '#f1f5f9',
                        color: ESTADO_COLORS[item.estado] || '#475569',
                      }}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: PRIORIDAD_BG[item.prioridad] || '#f1f5f9',
                        color: PRIORIDAD_COLORS[item.prioridad] || '#475569',
                      }}
                    >
                      {item.prioridad}
                    </span>
                  </td>
                  <td>{formatDate(item.fecha_limite)}</td>
                  <td className="td-descripcion">{item.descripcion || '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn-icon btn-edit"
                        title="Editar"
                        onClick={() => navigate(`/editar/${item.id}`)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        title="Eliminar"
                        onClick={() => setDeleteConfirm(item)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upcoming Deadlines View */}
      {view === VIEW_UPCOMING && (
        <div className="upcoming-section">
          <div className="upcoming-header">
            <h2 className="upcoming-title">⏰ Próximos vencimientos</h2>
            <span className="upcoming-subtitle">Iniciativas con fecha límite en los próximos 7 días</span>
          </div>

          {loadingUpcoming && (
            <div className="loading-container">
              <div className="spinner" />
              <span>Cargando próximos vencimientos…</span>
            </div>
          )}

          {!loadingUpcoming && proximosVencimientos.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">✅</span>
              <h3>Sin vencimientos próximos</h3>
              <p>No hay iniciativas con fecha límite en los próximos 7 días.</p>
            </div>
          )}

          {!loadingUpcoming && proximosVencimientos.length > 0 && (
            <div className="table-wrapper">
              <table className="iniciativas-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Responsable</th>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Fecha Límite</th>
                    <th>Días restantes</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proximosVencimientos.map((item) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const due = new Date(item.fecha_limite);
                    due.setHours(0, 0, 0, 0);
                    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
                    const urgencyClass = diffDays === 0 ? 'urgency-today' : diffDays <= 2 ? 'urgency-critical' : 'urgency-soon';
                    return (
                      <tr key={item.id} className={urgencyClass}>
                        <td className="td-nombre">{item.nombre}</td>
                        <td>{item.responsable}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: ESTADO_BG[item.estado] || '#f1f5f9',
                              color: ESTADO_COLORS[item.estado] || '#475569',
                            }}
                          >
                            {item.estado}
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: PRIORIDAD_BG[item.prioridad] || '#f1f5f9',
                              color: PRIORIDAD_COLORS[item.prioridad] || '#475569',
                            }}
                          >
                            {item.prioridad}
                          </span>
                        </td>
                        <td>{formatDate(item.fecha_limite)}</td>
                        <td>
                          <span className={`days-badge ${urgencyClass}`}>
                            {diffDays === 0 ? '🔴 Hoy' : diffDays === 1 ? '🟠 1 día' : `🟡 ${diffDays} días`}
                          </span>
                        </td>
                        <td className="td-descripcion">{item.descripcion || '—'}</td>
                        <td>
                          <div className="action-btns">
                            <button
                              className="btn-icon btn-edit"
                              title="Editar"
                              onClick={() => navigate(`/editar/${item.id}`)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              title="Eliminar"
                              onClick={() => setDeleteConfirm(item)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {!loading && !error && view === VIEW_KANBAN && (
        <KanbanBoard
          iniciativas={iniciativasFiltradas}
          onEdit={(item) => navigate(`/editar/${item.id}`)}
          onDelete={(item) => setDeleteConfirm(item)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Eliminar iniciativa?</h3>
            <p>
              Estás por eliminar <strong>{deleteConfirm.nombre}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

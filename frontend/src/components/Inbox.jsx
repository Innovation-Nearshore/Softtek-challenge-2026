import { useState, useEffect, useCallback } from 'react';
import {
  getTipos,
  getSolicitudes,
  updateEstado,
  getHistorialById,
} from '../api';

// DB estado values (must match PostgreSQL CHECK constraint exactly)
const ST_RECIBIDA   = 'Recibida';
const ST_EN_REV     = 'En revisión';   // En revision with accent
const ST_RESUELTA   = 'Resuelta';

const FSM = {
  [ST_RECIBIDA]: ST_EN_REV,
  [ST_EN_REV]:   ST_RESUELTA,
  [ST_RESUELTA]: null,
};

const URGENCIA_BADGE = {
  Alta:  'badge-alta',
  Media: 'badge-media',
  Baja:  'badge-baja',
};

const ESTADO_BADGE = {
  [ST_RECIBIDA]: 'badge-recibida',
  [ST_EN_REV]:   'badge-en-revision',
  [ST_RESUELTA]: 'badge-resuelta',
};

function estadoBadge(e) { return ESTADO_BADGE[e] || ''; }
function nextEstado(e)   { return FSM[e] ?? null; }

// Risk indicator for stale high-priority requests (Alta + Recibida + >24h)
function StaleRiskBadge() {
  return (
    <span
      title="Solicitud de alta urgencia sin atender por más de 24 horas"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        background: '#fee2e2',
        color: '#b91c1c',
        border: '1px solid #fca5a5',
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '0.72rem',
        fontWeight: 700,
        marginLeft: '6px',
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
      }}
    >
      ⚠ Riesgo
    </span>
  );
}

export default function Inbox() {
  const [tipos, setTipos]           = useState([]);
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [filters, setFilters]       = useState({ tipo: '', urgencia: '', responsable: '' });

  // FSM modal
  const [transitioning, setTransitioning]   = useState(null);
  const [responsable, setResponsable]       = useState('');
  const [transError, setTransError]         = useState(null);
  const [transSubmitting, setTransSubmitting] = useState(false);

  // History modal
  const [histModal, setHistModal]   = useState(null);
  const [histLoading, setHistLoading] = useState(false);

  useEffect(() => {
    getTipos().then((r) => setTipos(r.data)).catch(() => {});
  }, []);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.tipo)        params.tipo        = filters.tipo;
      if (filters.urgencia)    params.urgencia    = filters.urgencia;
      if (filters.responsable) params.responsable = filters.responsable;
      const res = await getSolicitudes(params);
      setRows(res.data);
    } catch {
      setError('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchSolicitudes(); }, [fetchSolicitudes]);

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function clearFilters() {
    setFilters({ tipo: '', urgencia: '', responsable: '' });
  }

  // --- FSM Transition ---
  function openTransition(row) {
    setTransitioning({ row });
    setResponsable(row.responsable || '');
    setTransError(null);
  }

  function closeTransition() {
    setTransitioning(null);
    setResponsable('');
    setTransError(null);
  }

  async function confirmTransition() {
    if (!transitioning) return;
    const { row } = transitioning;
    const next = nextEstado(row.estado);
    if (!next) return;

    if (next === ST_EN_REV && !responsable.trim()) {
      setTransError('El responsable es requerido para pasar a En revision');
      return;
    }

    setTransSubmitting(true);
    setTransError(null);
    try {
      await updateEstado(row.id, {
        estado: next,
        responsable: responsable.trim() || undefined,
      });
      closeTransition();
      fetchSolicitudes();
    } catch (err) {
      setTransError(err?.response?.data?.error || err?.response?.data?.errors?.responsable || 'Error al actualizar el estado');
    } finally {
      setTransSubmitting(false);
    }
  }

  // --- History ---
  async function openHistory(row) {
    setHistModal({ row, items: [] });
    setHistLoading(true);
    try {
      const res = await getHistorialById(row.id);
      setHistModal({ row, items: res.data });
    } catch {
      setHistModal({ row, items: [], loadError: true });
    } finally {
      setHistLoading(false);
    }
  }

  function closeHistory() { setHistModal(null); }

  return (
    <div className="page-container">
      <h1 className="page-title">Bandeja de solicitudes</h1>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label htmlFor="f-tipo">Tipo</label>
          <select id="f-tipo" name="tipo" value={filters.tipo} onChange={handleFilterChange}>
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.nombre}>{t.nombre}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="f-urgencia">Urgencia</label>
          <select id="f-urgencia" name="urgencia" value={filters.urgencia} onChange={handleFilterChange}>
            <option value="">Todas</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="f-responsable">Responsable</label>
          <input
            id="f-responsable"
            type="text"
            name="responsable"
            value={filters.responsable}
            onChange={handleFilterChange}
            placeholder="Buscar responsable..."
          />
        </div>

        <button className="btn btn-ghost" onClick={clearFilters}>Limpiar</button>
      </div>

      {/* States */}
      {loading && <div className="loading-msg">Cargando solicitudes...</div>}
      {error   && <div className="alert alert-error">{error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div className="empty-state">No hay solicitudes que coincidan con los filtros.</div>
      )}

      {/* Table */}
      {!loading && rows.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Titulo</th>
                <th>Tipo</th>
                <th>Urgencia</th>
                <th>Estado</th>
                <th>Solicitante</th>
                <th>Area</th>
                <th>Responsable</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const next = nextEstado(row.estado);
                const isStale = row.stale_high === true || row.stale_high === 't';
                return (
                  <tr
                    key={row.id}
                    style={isStale ? { background: '#fff5f5', borderLeft: '3px solid #ef4444' } : {}}
                  >
                    <td className="ticket-cell">
                      {row.numero_ticket}
                      {isStale && <StaleRiskBadge />}
                    </td>
                    <td>{row.titulo}</td>
                    <td>{row.tipo_solicitud_nombre}</td>
                    <td>
                      <span className={`badge ${URGENCIA_BADGE[row.urgencia] || ''}`}>
                        {row.urgencia}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${estadoBadge(row.estado)}`}>
                        {row.estado}
                      </span>
                    </td>
                    <td>{row.solicitante}</td>
                    <td>{row.area_solicitante_nombre}</td>
                    <td>{row.responsable || <span className="text-muted">-</span>}</td>
                    <td className="actions-cell">
                      {next && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => openTransition(row)}
                          title={`Avanzar a ${next}`}
                        >
                          {next === ST_EN_REV ? 'En revision' : next}
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => openHistory(row)}
                        title="Ver historial"
                      >
                        Historial
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* FSM Transition Modal */}
      {transitioning && (
        <div className="modal-backdrop" onClick={closeTransition}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cambiar estado</h2>
              <button className="modal-close" onClick={closeTransition}>x</button>
            </div>
            <div className="modal-body">
              <p><strong>Ticket:</strong> {transitioning.row.numero_ticket}</p>
              <p>
                <strong>Estado actual:</strong>{' '}
                <span className={`badge ${estadoBadge(transitioning.row.estado)}`}>
                  {transitioning.row.estado}
                </span>
              </p>
              <p>
                <strong>Nuevo estado:</strong>{' '}
                <span className={`badge ${estadoBadge(nextEstado(transitioning.row.estado))}`}>
                  {nextEstado(transitioning.row.estado)}
                </span>
              </p>

              {nextEstado(transitioning.row.estado) === ST_EN_REV && (
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label htmlFor="trans-responsable">
                    Responsable <span className="required">*</span>
                  </label>
                  <input
                    id="trans-responsable"
                    type="text"
                    value={responsable}
                    onChange={(e) => { setResponsable(e.target.value); setTransError(null); }}
                    placeholder="Nombre del responsable"
                    className={transError ? 'input-error' : ''}
                    autoFocus
                  />
                </div>
              )}

              {transError && (
                <div className="alert alert-error" style={{ marginTop: '12px' }}>
                  {transError}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeTransition}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmTransition} disabled={transSubmitting}>
                {transSubmitting ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {histModal && (
        <div className="modal-backdrop" onClick={closeHistory}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Historial - {histModal.row.numero_ticket}</h2>
              <button className="modal-close" onClick={closeHistory}>x</button>
            </div>
            <div className="modal-body">
              {histLoading && <div className="loading-msg">Cargando historial...</div>}
              {histModal.loadError && (
                <div className="alert alert-error">Error al cargar historial</div>
              )}
              {!histLoading && !histModal.loadError && histModal.items.length === 0 && (
                <div className="empty-state">No hay entradas de historial.</div>
              )}
              {!histLoading && histModal.items.length > 0 && (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Estado anterior</th>
                        <th>Estado nuevo</th>
                        <th>Usuario / Responsable</th>
                        <th>Comentario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {histModal.items.map((h) => (
                        <tr key={h.id}>
                          <td className="nowrap">
                            {new Date(h.fecha_cambio).toLocaleString('es-AR')}
                          </td>
                          <td>
                            {h.estado_anterior
                              ? <span className={`badge ${estadoBadge(h.estado_anterior)}`}>{h.estado_anterior}</span>
                              : <span className="text-muted">-</span>
                            }
                          </td>
                          <td>
                            <span className={`badge ${estadoBadge(h.estado_nuevo)}`}>
                              {h.estado_nuevo}
                            </span>
                          </td>
                          <td>{h.usuario || <span className="text-muted">-</span>}</td>
                          <td>{h.comentario || <span className="text-muted">-</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeHistory}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

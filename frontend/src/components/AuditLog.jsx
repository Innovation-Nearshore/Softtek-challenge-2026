import { useState, useEffect, useCallback } from 'react';
import { getHistorial, getTipos } from '../api';

const URGENCIA_OPTS = ['Alta', 'Media', 'Baja'];
// Estado values must match DB CHECK constraint exactly (with accent)
const ESTADO_OPTS = ['Recibida', 'En revisi\u00f3n', 'Resuelta'];

const URGENCIA_BADGE = {
  Alta:  'badge-alta',
  Media: 'badge-media',
  Baja:  'badge-baja',
};

const ESTADO_BADGE = {
  'Recibida':          'badge-recibida',
  'En revisi\u00f3n': 'badge-en-revision',
  'Resuelta':          'badge-resuelta',
};

function estadoBadge(e) { return ESTADO_BADGE[e] || ''; }

function fmt(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const EMPTY_FILTERS = { tipo: '', urgencia: '', responsable: '', estado: '', ticket: '' };

export default function AuditLog() {
  const [tipos,   setTipos]   = useState([]);
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    getTipos().then((r) => setTipos(r.data)).catch(() => {});
  }, []);

  const fetchData = useCallback(async (f) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (f.tipo)        params.tipo        = f.tipo;
      if (f.urgencia)    params.urgencia    = f.urgencia;
      if (f.responsable) params.responsable = f.responsable;
      if (f.estado)      params.estado      = f.estado;
      if (f.ticket)      params.ticket      = f.ticket;
      const res = await getHistorial(params);
      setRows(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar el historial.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(filters); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    fetchData(updated);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    fetchData(EMPTY_FILTERS);
  };

  return (
    <div className="screen-container">
      <h1 className="page-title">Auditoria - Historial de Cambios</h1>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label htmlFor="audit-ticket">Ticket</label>
          <input
            id="audit-ticket"
            name="ticket"
            type="text"
            placeholder="TK..."
            value={filters.ticket}
            onChange={handleFilter}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="audit-tipo">Tipo de solicitud</label>
          <select id="audit-tipo" name="tipo" value={filters.tipo} onChange={handleFilter}>
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.nombre}>{t.nombre}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="audit-urgencia">Urgencia</label>
          <select id="audit-urgencia" name="urgencia" value={filters.urgencia} onChange={handleFilter}>
            <option value="">Todas</option>
            {URGENCIA_OPTS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="audit-estado">Estado nuevo</label>
          <select id="audit-estado" name="estado" value={filters.estado} onChange={handleFilter}>
            <option value="">Todos</option>
            {ESTADO_OPTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="audit-responsable">Responsable</label>
          <input
            id="audit-responsable"
            name="responsable"
            type="text"
            placeholder="Nombre..."
            value={filters.responsable}
            onChange={handleFilter}
          />
        </div>

        <button className="btn btn-secondary" onClick={clearFilters}>
          Limpiar filtros
        </button>
      </div>

      {/* Content */}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state">Cargando historial...</div>
      ) : rows.length === 0 ? (
        <div className="empty-state">No se encontraron registros con los filtros seleccionados.</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha / Hora</th>
                <th>Ticket</th>
                <th>Titulo</th>
                <th>Tipo</th>
                <th>Urgencia</th>
                <th>Estado anterior</th>
                <th>Estado nuevo</th>
                <th>Responsable</th>
                <th>Comentario</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="nowrap">{fmt(r.fecha_cambio)}</td>
                  <td className="ticket-cell">{r.numero_ticket || '-'}</td>
                  <td>{r.titulo}</td>
                  <td>{r.tipo_solicitud_nombre}</td>
                  <td>
                    {r.urgencia
                      ? <span className={`badge ${URGENCIA_BADGE[r.urgencia] || ''}`}>{r.urgencia}</span>
                      : '-'}
                  </td>
                  <td>
                    {r.estado_anterior
                      ? <span className={`badge ${estadoBadge(r.estado_anterior)}`}>{r.estado_anterior}</span>
                      : <span className="text-muted">-</span>
                    }
                  </td>
                  <td>
                    <span className={`badge ${estadoBadge(r.estado_nuevo)}`}>{r.estado_nuevo}</span>
                  </td>
                  <td>{r.usuario || r.solicitante || '-'}</td>
                  <td className="comment-cell">{r.comentario || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="record-count">
            {rows.length} registro{rows.length !== 1 ? 's' : ''} encontrado{rows.length !== 1 ? 's' : ''}.
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProximosVencimientos, deleteIniciativa } from '../services/api';
import { ESTADO_COLORS, ESTADO_BG, PRIORIDAD_COLORS, PRIORIDAD_BG } from '../utils/constants';
import './ProximosVencimientos.css';

export default function ProximosVencimientos() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getProximosVencimientos();
      setItems(data.data || data);
    } catch {
      setError('No se pudieron cargar los próximos vencimientos. Verifica que el servidor esté en línea.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    try {
      await deleteIniciativa(id);
      setDeleteConfirm(null);
      fetchData();
    } catch {
      setError('No se pudo eliminar la iniciativa.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getDiffDays = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    return Math.round((due - today) / (1000 * 60 * 60 * 24));
  };

  const getUrgencyClass = (diff) => {
    if (diff === 0) return 'urgency-today';
    if (diff <= 2) return 'urgency-critical';
    return 'urgency-soon';
  };

  const getDaysLabel = (diff) => {
    if (diff === 0) return '🔴 Hoy';
    if (diff === 1) return '🟠 1 día';
    if (diff <= 2) return `🟠 ${diff} días`;
    return `🟡 ${diff} días`;
  };

  return (
    <div className="pv-page">
      {/* Header */}
      <div className="pv-header">
        <div>
          <h1 className="pv-title">⏰ Próximos vencimientos</h1>
          <p className="pv-subtitle">
            Iniciativas con fecha límite entre hoy y los próximos 7 días — actualizado dinámicamente
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Volver al Dashboard
        </button>
      </div>

      {/* Legend */}
      <div className="pv-legend">
        <span className="legend-item urgency-today">🔴 Vence hoy</span>
        <span className="legend-item urgency-critical">🟠 1–2 días</span>
        <span className="legend-item urgency-soon">🟡 3–7 días</span>
      </div>

      {/* Error */}
      {error && <div className="error-banner">{error}</div>}

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <span>Cargando próximos vencimientos…</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">✅</span>
          <h3>Sin vencimientos próximos</h3>
          <p>No hay iniciativas con fecha límite en los próximos 7 días. ¡Todo bajo control!</p>
        </div>
      )}

      {/* Counter badge */}
      {!loading && !error && items.length > 0 && (
        <div className="pv-counter">
          <span className="pv-counter__badge">{items.length}</span>
          <span className="pv-counter__text">
            {items.length === 1 ? 'iniciativa próxima a vencer' : 'iniciativas próximas a vencer'}
          </span>
        </div>
      )}

      {/* Table */}
      {!loading && !error && items.length > 0 && (
        <div className="table-wrapper">
          <table className="pv-table">
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
              {items.map((item) => {
                const diff = getDiffDays(item.fecha_limite);
                const urgencyClass = getUrgencyClass(diff);
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
                        {getDaysLabel(diff)}
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

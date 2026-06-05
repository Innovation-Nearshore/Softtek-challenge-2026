import { useRef, useState } from 'react';
import { ESTADOS, ESTADO_COLORS, ESTADO_BG, PRIORIDAD_COLORS, PRIORIDAD_BG } from '../utils/constants';
import './KanbanBoard.css';

function KanbanCard({ item, onEdit, onDelete, onDragStart, onDragEnd, isDragging }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isOverdue = () => {
    if (!item.fecha_limite || item.estado === 'Completado') return false;
    return new Date(item.fecha_limite) < new Date();
  };

  return (
    <div
      className={`kanban-card ${isOverdue() ? 'kanban-card--overdue' : ''} ${isDragging ? 'kanban-card--dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragEnd={onDragEnd}
    >
      <div className="kanban-card__header">
        <span
          className="kanban-card__prioridad"
          style={{
            background: PRIORIDAD_BG[item.prioridad] || '#f1f5f9',
            color: PRIORIDAD_COLORS[item.prioridad] || '#475569',
          }}
        >
          {item.prioridad}
        </span>
        <div className="kanban-card__actions">
          <button className="btn-icon" title="Editar" onClick={() => onEdit(item)}>✏️</button>
          <button className="btn-icon" title="Eliminar" onClick={() => onDelete(item)}>🗑️</button>
        </div>
      </div>

      <h4 className="kanban-card__nombre">{item.nombre}</h4>

      {item.descripcion && (
        <p className="kanban-card__descripcion">{item.descripcion}</p>
      )}

      <div className="kanban-card__footer">
        <span className="kanban-card__responsable">👤 {item.responsable}</span>
        <span className={`kanban-card__fecha ${isOverdue() ? 'kanban-card__fecha--overdue' : ''}`}>
          📅 {formatDate(item.fecha_limite)}{isOverdue() && ' ⚠️'}
        </span>
      </div>
    </div>
  );
}

export default function KanbanBoard({ iniciativas, onEdit, onDelete, onStatusChange }) {
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const dragItem = useRef(null);

  const columns = ESTADOS.map((estado) => ({
    estado,
    items: iniciativas.filter((i) => i.estado === estado),
  }));

  const handleDragStart = (e, item) => {
    dragItem.current = item;
    setDraggingId(item.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(item.id));
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, estado) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(estado);
  };

  const handleDragLeave = (e) => {
    // Only clear when leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, targetEstado) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!dragItem.current) return;
    if (dragItem.current.estado === targetEstado) return;
    onStatusChange(dragItem.current, targetEstado);
    dragItem.current = null;
    setDraggingId(null);
  };

  return (
    <div className="kanban-board">
      {columns.map(({ estado, items }) => (
        <div
          key={estado}
          className={`kanban-column ${dragOverColumn === estado ? 'kanban-column--drop-target' : ''}`}
          onDragOver={(e) => handleDragOver(e, estado)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, estado)}
        >
          <div
            className="kanban-column__header"
            style={{
              background: ESTADO_BG[estado],
              borderTop: `4px solid ${ESTADO_COLORS[estado]}`,
            }}
          >
            <span className="kanban-column__title" style={{ color: ESTADO_COLORS[estado] }}>
              {estado}
            </span>
            <span className="kanban-column__count" style={{ background: ESTADO_COLORS[estado], color: '#fff' }}>
              {items.length}
            </span>
          </div>

          <div className="kanban-column__body">
            {items.length === 0 ? (
              <div className="kanban-column__empty">
                {dragOverColumn === estado ? '⬇ Suelta aquí' : 'Sin iniciativas'}
              </div>
            ) : (
              items.map((item) => (
                <KanbanCard
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggingId === item.id}
                />
              ))
            )}
            {dragOverColumn === estado && items.length > 0 && (
              <div className="kanban-drop-placeholder">⬇ Suelta aquí</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

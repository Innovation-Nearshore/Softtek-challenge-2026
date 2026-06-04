import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { updateInitiativeStatus } from '../services/initiativesService';
import { formatDate } from '../utils/dateUtils';

const ESTADOS = ['Pendiente', 'En curso', 'Completado'];

const COLUMN_COLORS = {
  Pendiente: '#fff9c4',
  'En curso': '#bbdefb',
  Completado: '#c8e6c9',
};

function PriorityBadge({ prioridad }) {
  const colors = { Alta: 'red', Media: 'orange', Baja: 'green' };
  return (
    <span style={{ color: colors[prioridad] || 'inherit', fontWeight: 'bold', fontSize: '12px' }}>
      [{prioridad}]
    </span>
  );
}

export default function KanbanBoard({ initiatives, onUpdate }) {
  // Build columns from initiatives prop
  const [columns, setColumns] = useState({});

  useEffect(() => {
    const safeInitiatives = Array.isArray(initiatives) ? initiatives : [];
    const grouped = {};
    ESTADOS.forEach((e) => (grouped[e] = []));
    safeInitiatives.forEach((i) => {
      if (grouped[i.estado] !== undefined) {
        grouped[i.estado].push(i);
      }
    });
    setColumns(grouped);
  }, [initiatives]);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a column or same position
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    if (sourceCol === destCol) {
      // Reorder within same column (no DB update needed)
      const items = Array.from(columns[sourceCol]);
      const [moved] = items.splice(source.index, 1);
      items.splice(destination.index, 0, moved);
      setColumns((prev) => ({ ...prev, [sourceCol]: items }));
      return;
    }

    // Moving to a different column — update estado in DB
    const initiativeId = parseInt(draggableId, 10);
    const newEstado = destCol;

    // Optimistic UI update
    const sourceItems = Array.from(columns[sourceCol]);
    const destItems = Array.from(columns[destCol]);
    const [movedItem] = sourceItems.splice(source.index, 1);
    const updatedItem = { ...movedItem, estado: newEstado };
    destItems.splice(destination.index, 0, updatedItem);

    setColumns((prev) => ({
      ...prev,
      [sourceCol]: sourceItems,
      [destCol]: destItems,
    }));

    try {
      await updateInitiativeStatus(initiativeId, newEstado);
      // Notify parent to refresh data
      if (onUpdate) onUpdate();
    } catch (err) {
      // Revert optimistic update on failure
      setColumns((prev) => {
        const revertSource = Array.from(prev[sourceCol]);
        const revertDest = Array.from(prev[destCol]);
        const [revertItem] = revertDest.splice(destination.index, 1);
        revertSource.splice(source.index, 0, revertItem);
        return { ...prev, [sourceCol]: revertSource, [destCol]: revertDest };
      });
      window.alert('No se pudo actualizar el estado. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2>Kanban</h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {ESTADOS.map((estado) => (
            <div
              key={estado}
              style={{
                flex: 1,
                minWidth: '220px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: COLUMN_COLORS[estado] || '#fafafa',
              }}
            >
              {/* Column header */}
              <div
                style={{
                  padding: '8px 12px',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #ccc',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{estado}</span>
                <span style={{ fontWeight: 'normal', fontSize: '13px' }}>
                  {(columns[estado] || []).length}
                </span>
              </div>

              <Droppable droppableId={estado}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: '120px',
                      padding: '8px',
                      backgroundColor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : 'transparent',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    {(columns[estado] || []).map((initiative, index) => (
                      <Draggable
                        key={String(initiative.id)}
                        draggableId={String(initiative.id)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              padding: '8px',
                              marginBottom: '8px',
                              background: snapshot.isDragging ? '#e3f2fd' : '#fff',
                              border: '1px solid #bbb',
                              borderRadius: '3px',
                              boxShadow: snapshot.isDragging ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                              cursor: 'grab',
                              fontSize: '13px',
                              ...provided.draggableProps.style,
                            }}
                          >
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                              {initiative.nombre}
                            </div>
                            <div>👤 {initiative.responsable}</div>
                            <div>
                              <PriorityBadge prioridad={initiative.prioridad} />
                            </div>
                            <div style={{ color: '#555', fontSize: '12px' }}>
                              📅 {formatDate(initiative.fecha_limite)}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

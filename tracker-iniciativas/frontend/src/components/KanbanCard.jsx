/**
 * KanbanCard.jsx
 * Draggable card for the Kanban board.
 * Uses @dnd-kit/core useDraggable — carries the full iniciativa as drag data.
 */

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { formatFecha, getPrioridadClasses } from '../utils/formatters';

const KanbanCard = ({ iniciativa, isSaving }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: String(iniciativa.id),
      data: { iniciativa },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.45 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      aria-label={`Iniciativa: ${iniciativa.nombre}`}
      className={`relative select-none rounded-xl border bg-white px-4 py-3 shadow-sm transition-shadow
                  ${isDragging ? 'shadow-xl ring-2 ring-indigo-400' : 'hover:shadow-md'}
                  ${isSaving ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {/* Saving overlay indicator */}
      {isSaving && (
        <span className="absolute right-2 top-2">
          <svg
            className="h-3.5 w-3.5 animate-spin text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </span>
      )}

      {/* Card title */}
      <p
        className="mb-1.5 text-sm font-semibold leading-snug text-gray-800 line-clamp-2"
        title={iniciativa.nombre}
      >
        {iniciativa.nombre}
      </p>

      {/* Responsable */}
      <p className="mb-2 flex items-center gap-1 text-xs text-gray-500">
        <svg
          className="h-3.5 w-3.5 shrink-0 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        {iniciativa.responsable}
      </p>

      {/* Footer row: fecha + prioridad */}
      <div className="flex flex-wrap items-center justify-between gap-1">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <svg
            className="h-3.5 w-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {formatFecha(iniciativa.fecha_limite)}
        </span>

        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPrioridadClasses(
            iniciativa.prioridad
          )}`}
        >
          {iniciativa.prioridad}
        </span>
      </div>
    </div>
  );
};

export default KanbanCard;

/**
 * KanbanColumn.jsx
 * Drop target column for the Kanban board.
 * Uses @dnd-kit/core useDroppable — accepts cards dragged into it.
 */

import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';

/** Column visual config per estado */
const COLUMN_CONFIG = {
  Pendiente: {
    label: 'Pendiente',
    headerBg: 'bg-yellow-50 border-yellow-200',
    titleColor: 'text-yellow-700',
    countBg: 'bg-yellow-100 text-yellow-700',
    dot: 'bg-yellow-400',
    emptyText: 'Sin iniciativas pendientes',
  },
  'En curso': {
    label: 'En curso',
    headerBg: 'bg-blue-50 border-blue-200',
    titleColor: 'text-blue-700',
    countBg: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
    emptyText: 'Ninguna en curso',
  },
  Completado: {
    label: 'Completado',
    headerBg: 'bg-green-50 border-green-200',
    titleColor: 'text-green-700',
    countBg: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
    emptyText: 'Nada completado aún',
  },
};

/**
 * @param {{
 *   estado: string,
 *   items: Array,
 *   savingIds: Set<string>,
 * }} props
 */
const KanbanColumn = ({ estado, items, savingIds }) => {
  const config = COLUMN_CONFIG[estado] ?? {
    label: estado,
    headerBg: 'bg-gray-50 border-gray-200',
    titleColor: 'text-gray-700',
    countBg: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
    emptyText: 'Sin iniciativas',
  };

  const { setNodeRef, isOver } = useDroppable({ id: estado });

  return (
    <div className="flex min-w-[260px] flex-1 flex-col">
      {/* Column header */}
      <div
        className={`mb-3 flex items-center justify-between rounded-xl border px-4 py-2.5 ${config.headerBg}`}
      >
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} aria-hidden="true" />
          <h3 className={`text-sm font-semibold ${config.titleColor}`}>{config.label}</h3>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${config.countBg}`}
          aria-label={`${items.length} iniciativas`}
        >
          {items.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-2xl border-2 border-dashed p-2 transition-colors
          ${
            isOver
              ? 'border-indigo-400 bg-indigo-50/60'
              : 'border-gray-200 bg-gray-50/50'
          }`}
        style={{ minHeight: '300px' }}
      >
        {/* Cards */}
        {items.length > 0 ? (
          <div className="space-y-2.5">
            {items.map((item) => (
              <KanbanCard
                key={item.id}
                iniciativa={item}
                isSaving={savingIds.has(String(item.id))}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center py-10">
            <p className="text-xs text-gray-400">{config.emptyText}</p>
          </div>
        )}

        {/* Drop-here indicator shown when dragging over an empty or populated column */}
        {isOver && (
          <div className="mt-2 rounded-lg border border-dashed border-indigo-300 bg-indigo-50 py-3 text-center text-xs text-indigo-400">
            Soltar aquí
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;

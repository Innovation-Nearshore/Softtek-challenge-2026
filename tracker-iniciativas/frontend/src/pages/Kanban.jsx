/**
 * Kanban.jsx
 * BONUS 2 — Vista Kanban con Drag & Drop.
 *
 * Arquitectura:
 * - DndContext (@dnd-kit/core) envuelve las tres KanbanColumn (droppable).
 * - Cada KanbanCard (draggable) lleva el objeto completo de iniciativa.
 * - Al soltar en otra columna:
 *   1. Actualización optimista local del estado (UX inmediato).
 *   2. PATCH /api/iniciativas/:id con el nuevo estado (persistencia real).
 *   3. Si el PATCH falla, revierte al estado anterior y muestra error.
 * - savingIds: Set de IDs actualmente guardándose, bloqueando re-drag durante PATCH.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { getIniciativas, updateIniciativa } from '../services/iniciativasService';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';

const ESTADOS = ['Pendiente', 'En curso', 'Completado'];

const Kanban = () => {
  // ── Data state ─────────────────────────────────────────────────────────────
  const [iniciativas, setIniciativas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // ── DnD state ───────────────────────────────────────────────────────────────
  const [activeCard, setActiveCard] = useState(null);   // card being dragged
  const [savingIds, setSavingIds] = useState(new Set()); // IDs currently PATCHing
  const [patchError, setPatchError] = useState(null);   // last PATCH error message

  // ── Sensors ─────────────────────────────────────────────────────────────────
  // PointerSensor with 8px activation distance to avoid accidental drags on click
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getIniciativas();
      setIniciativas(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message || 'Error al cargar iniciativas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── DnD handlers ────────────────────────────────────────────────────────────
  const handleDragStart = ({ active }) => {
    const card = iniciativas.find((i) => String(i.id) === active.id);
    setActiveCard(card ?? null);
    setPatchError(null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveCard(null);

    // No valid drop target or same column → nothing to do
    if (!over) return;
    const newEstado = over.id; // droppable id === estado string
    const card = iniciativas.find((i) => String(i.id) === active.id);
    if (!card || card.estado === newEstado) return;

    const cardId = String(card.id);
    const previousIniciativas = [...iniciativas];

    // 1. Optimistic update
    setIniciativas((prev) =>
      prev.map((i) => (String(i.id) === cardId ? { ...i, estado: newEstado } : i))
    );

    // 2. Mark as saving
    setSavingIds((prev) => new Set(prev).add(cardId));

    try {
      await updateIniciativa(card.id, { estado: newEstado });
    } catch (err) {
      // 3. Revert on failure
      setIniciativas(previousIniciativas);
      setPatchError(
        `No se pudo guardar el cambio de "${card.nombre}": ${err.message}`
      );
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }
  };

  const handleDragCancel = () => {
    setActiveCard(null);
  };

  // ── Grouped data ─────────────────────────────────────────────────────────────
  const columnData = ESTADOS.reduce((acc, estado) => {
    acc[estado] = iniciativas.filter((i) => i.estado === estado);
    return acc;
  }, {});

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vista Kanban</h1>
          <p className="mt-1 text-sm text-gray-500">
            Arrastra las tarjetas entre columnas para cambiar el estado. Los cambios se guardan automáticamente.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white
                     px-4 py-2 text-sm font-medium text-gray-700 shadow-sm
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300
                     disabled:cursor-not-allowed disabled:opacity-50 transition"
          aria-label="Actualizar tablero"
        >
          <svg
            className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
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
          Actualizar
        </button>
      </div>

      {/* PATCH error banner */}
      {patchError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>{patchError}</span>
          <button
            type="button"
            onClick={() => setPatchError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
            aria-label="Cerrar error"
          >
            ×
          </button>
        </div>
      )}

      {/* Fetch error */}
      {fetchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-center text-sm text-red-600">
          {fetchError}
          <button
            type="button"
            onClick={fetchData}
            className="ml-2 font-semibold underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !iniciativas.length && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ESTADOS.map((e) => (
            <div
              key={e}
              className="h-64 animate-pulse rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50"
            />
          ))}
        </div>
      )}

      {/* Kanban board */}
      {!fetchError && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {ESTADOS.map((estado) => (
              <KanbanColumn
                key={estado}
                estado={estado}
                items={columnData[estado]}
                savingIds={savingIds}
              />
            ))}
          </div>

          {/* DragOverlay: ghost card rendered at pointer position while dragging */}
          <DragOverlay dropAnimation={null}>
            {activeCard ? (
              <div className="rotate-1 scale-105 shadow-2xl">
                <KanbanCard iniciativa={activeCard} isSaving={false} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Hint footer */}
      <p className="text-center text-xs text-gray-400">
        💡 Arrastra una tarjeta a otra columna para cambiar su estado. El cambio se persiste automáticamente en la base de datos.
      </p>
    </div>
  );
};

export default Kanban;

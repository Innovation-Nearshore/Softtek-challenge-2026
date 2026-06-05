import { useState, useMemo, useCallback } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import useInitiatives from '../hooks/useInitiatives'
import useToast from '../hooks/useToast'
import KanbanColumn from '../components/organisms/KanbanColumn'
import InitiativeForm from '../components/organisms/InitiativeForm'
import Toast from '../components/molecules/Toast'
import Spinner from '../components/atoms/Spinner'
import Button from '../components/atoms/Button'
import Heading from '../components/atoms/Heading'

const STATUSES = ['Pendiente', 'En curso', 'Completado']

const PRIORITY_OPTIONS = ['Todas', 'Alta', 'Media', 'Baja']

/**
 * Page: KanbanPage
 * Drag-and-drop Kanban board for managing initiative statuses.
 * Cards can be dragged between columns to update estado via PATCH.
 */
const KanbanPage = () => {
  const {
    initiatives,
    loading,
    error,
    createInitiative,
    patchInitiative,
    refetch,
  } = useInitiatives('Todos')

  const { toast, showToast, hideToast } = useToast()

  const [priorityFilter, setPriorityFilter] = useState('Todas')
  const [responsableFilter, setResponsableFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  // Unique responsables for filter dropdown
  const responsables = useMemo(() => {
    const names = [...new Set(initiatives.map((i) => i.responsable))].sort()
    return names
  }, [initiatives])

  // Client-side filtered initiatives
  const filtered = useMemo(() => {
    return initiatives.filter((i) => {
      const matchPriority = priorityFilter === 'Todas' || i.prioridad === priorityFilter
      const matchResponsable = !responsableFilter || i.responsable === responsableFilter
      return matchPriority && matchResponsable
    })
  }, [initiatives, priorityFilter, responsableFilter])

  // Group by status
  const columns = useMemo(() => {
    const groups = {}
    STATUSES.forEach((s) => {
      groups[s] = filtered.filter((i) => i.estado === s)
    })
    return groups
  }, [filtered])

  // Optimistic drag-and-drop handler
  const handleDragEnd = useCallback(
    async (result) => {
      const { destination, source, draggableId } = result

      // Dropped outside a droppable or same column & same position
      if (!destination) return
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return

      const newStatus = destination.droppableId
      const initiativeId = parseInt(draggableId, 10)

      // Find the initiative being moved
      const initiative = initiatives.find((i) => i.id === initiativeId)
      if (!initiative || initiative.estado === newStatus) return

      try {
        await patchInitiative(initiativeId, { estado: newStatus })
        showToast(`Estado actualizado a "${newStatus}"`, 'success')
      } catch {
        showToast('Error al actualizar el estado. Revirtiendo.', 'error')
        refetch()
      }
    },
    [initiatives, patchInitiative, refetch, showToast]
  )

  const handleCreateInitiative = async (data) => {
    setFormLoading(true)
    try {
      await createInitiative(data)
      setShowForm(false)
      showToast('Iniciativa creada correctamente', 'success')
    } catch {
      showToast('Error al crear la iniciativa', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  // Loading skeleton
  if (loading && initiatives.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Spinner size="lg" />
          <p className="text-sm">Cargando tablero Kanban…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Heading level={2}>Tablero Kanban</Heading>
          <p className="text-sm text-gray-500 mt-1">
            Arrastra las tarjetas entre columnas para cambiar el estado de cada iniciativa.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Iniciativa
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filtros</span>

        {/* Priority filter */}
        <div className="flex items-center gap-1">
          {PRIORITY_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors duration-150 ${
                priorityFilter === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200" />

        {/* Responsable filter */}
        <select
          value={responsableFilter}
          onChange={(e) => setResponsableFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">Todos los responsables</option>
          {responsables.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* Clear filters */}
        {(priorityFilter !== 'Todas' || responsableFilter) && (
          <button
            onClick={() => { setPriorityFilter('Todas'); setResponsableFilter('') }}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar
          </button>
        )}

        {/* Total visible */}
        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} iniciativa{filtered.length !== 1 ? 's' : ''} visibles
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          Error al cargar iniciativas: {error}
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '550px' }}>
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              initiatives={columns[status] || []}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Create Initiative Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl">
            <InitiativeForm
              onSubmit={handleCreateInitiative}
              onCancel={() => setShowForm(false)}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.visible && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  )
}

export default KanbanPage

import { useEffect, useState, useCallback } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { useInitiatives } from '../context/InitiativesContext'
import KanbanColumn from '../components/KanbanColumn'
import styles from './KanbanBoard.module.css'

const COLUMNS = ['Pendiente', 'En curso', 'Completado']

export default function KanbanBoard() {
  const {
    initiatives,
    loading,
    error,
    fetchInitiatives,
    fetchStats,
    editInitiative,
    removeInitiative,
  } = useInitiatives()

  // Local copy for optimistic updates
  const [localItems, setLocalItems] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [dragError, setDragError] = useState(null)

  const load = useCallback(async () => {
    await fetchInitiatives()
    await fetchStats()
  }, [fetchInitiatives, fetchStats])

  useEffect(() => {
    load()
  }, [load])

  // Keep local copy in sync with context whenever initiatives change
  useEffect(() => {
    setLocalItems(initiatives)
  }, [initiatives])

  // Group items into columns
  const columns = COLUMNS.reduce((acc, status) => {
    acc[status] = localItems.filter((i) => i.status === status)
    return acc
  }, {})

  async function onDragEnd(result) {
    const { source, destination, draggableId } = result

    // Dropped outside or same column + same position → no-op
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId
    const itemId = parseInt(draggableId, 10)

    // Optimistic UI update
    setDragError(null)
    setLocalItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    )

    // Persist to backend
    const item = localItems.find((i) => i.id === itemId)
    if (!item) return

    const result2 = await editInitiative(itemId, { ...item, status: newStatus })
    if (!result2.success) {
      // Revert on failure
      setLocalItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, status: item.status } : i
        )
      )
      setDragError(`No se pudo actualizar el estado: ${result2.error}`)
    }
  }

  function handleDeleteRequest(id, name) {
    setConfirmDelete({ id, name })
    setDeleteError(null)
  }

  async function handleDeleteConfirm() {
    if (!confirmDelete) return
    const result = await removeInitiative(confirmDelete.id)
    if (result.success) {
      setConfirmDelete(null)
    } else {
      setDeleteError(result.error)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tablero Kanban</h1>
        <button className={styles.btnRefresh} onClick={load} title="Actualizar datos">
          🔄 Actualizar
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          ⚠ {error}
        </div>
      )}

      {dragError && (
        <div className={styles.errorBanner} role="alert">
          ⚠ {dragError}
          <button className={styles.dismissBtn} onClick={() => setDragError(null)}>✕</button>
        </div>
      )}

      {loading && localItems.length === 0 ? (
        <div className={styles.loadingState}>
          <span className={styles.spinner} aria-label="Cargando..." />
          <p>Cargando iniciativas…</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className={styles.board}>
            {COLUMNS.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                initiatives={columns[status] ?? []}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className={styles.modal}>
            <h3 id="modal-title" className={styles.modalTitle}>Confirmar eliminación</h3>
            <p className={styles.modalBody}>
              ¿Estás seguro de que deseas eliminar la iniciativa{' '}
              <strong>&ldquo;{confirmDelete.name}&rdquo;</strong>? Esta acción no se puede deshacer.
            </p>
            {deleteError && <p className={styles.modalError}>⚠ {deleteError}</p>}
            <div className={styles.modalActions}>
              <button
                className={styles.btnModalCancel}
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
              <button className={styles.btnModalDelete} onClick={handleDeleteConfirm}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

import { useState } from 'react'
import useInitiatives from '../hooks/useInitiatives'
import useToast from '../hooks/useToast'
import Button from '../components/atoms/Button'
import Heading from '../components/atoms/Heading'
import Spinner from '../components/atoms/Spinner'
import StatusFilter from '../components/molecules/StatusFilter'
import ConfirmDialog from '../components/molecules/ConfirmDialog'
import Toast from '../components/molecules/Toast'
import InitiativeForm from '../components/organisms/InitiativeForm'
import InitiativesTable from '../components/organisms/InitiativesTable'

/**
 * Page: InitiativesPage
 * Main CRUD management page for initiatives.
 * Supports full-form editing (modal) and inline editing for
 * Nombre, Responsable, and Prioridad directly in the table row.
 */
const InitiativesPage = () => {
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [showForm, setShowForm] = useState(false)
  const [editingInitiative, setEditingInitiative] = useState(null)
  const [deletingInitiative, setDeletingInitiative] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { toast, showSuccess, showError, hideToast } = useToast()
  const {
    initiatives,
    loading,
    error,
    createInitiative,
    updateInitiative,
    patchInitiative,
    deleteInitiative,
  } = useInitiatives(statusFilter)

  // Compute status counts for filter badges
  const statusCounts = initiatives.reduce((acc, item) => {
    acc[item.estado] = (acc[item.estado] || 0) + 1
    return acc
  }, {})

  const handleOpenCreate = () => {
    setEditingInitiative(null)
    setShowForm(true)
  }

  const handleOpenEdit = (initiative) => {
    setEditingInitiative(initiative)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingInitiative(null)
  }

  const handleFormSubmit = async (data) => {
    setFormLoading(true)
    try {
      if (editingInitiative) {
        await updateInitiative(editingInitiative.id, data)
        showSuccess('Iniciativa actualizada correctamente')
      } else {
        await createInitiative(data)
        showSuccess('Iniciativa creada correctamente')
      }
      handleCloseForm()
    } catch (err) {
      showError(err.message || 'Error al guardar la iniciativa')
    } finally {
      setFormLoading(false)
    }
  }

  // Inline edit handler: sends ONLY the changed field via PATCH
  const handleInlineUpdate = async (id, field, value) => {
    try {
      await patchInitiative(id, { [field]: value })
      showSuccess('Campo actualizado correctamente')
    } catch (err) {
      showError(err.message || 'Error al actualizar el campo')
    }
  }

  const handleOpenDelete = (initiative) => {
    setDeletingInitiative(initiative)
  }

  const handleConfirmDelete = async () => {
    if (!deletingInitiative) return
    setDeleteLoading(true)
    try {
      await deleteInitiative(deletingInitiative.id)
      showSuccess('Iniciativa eliminada correctamente')
      setDeletingInitiative(null)
    } catch (err) {
      showError(err.message || 'Error al eliminar la iniciativa')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Heading level={1}>Iniciativas</Heading>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona todas las iniciativas del área de operaciones
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Iniciativa
        </Button>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <StatusFilter
          activeStatus={statusFilter}
          onChange={setStatusFilter}
          counts={statusCounts}
        />
      </div>

      {/* Inline editing hint */}
      <p className="text-xs text-gray-400 flex items-center gap-1.5 -mt-2">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Haz clic en <strong>Nombre</strong>, <strong>Responsable</strong> o <strong>Prioridad</strong> para editar directamente en la tabla. Usa &quot;Editar&quot; para modificar todos los campos.
      </p>

      {/* Error State */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
          <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Initiatives Table */}
      <InitiativesTable
        initiatives={initiatives}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onInlineUpdate={handleInlineUpdate}
      />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleCloseForm}
          />
          <div className="relative z-10 w-full max-w-2xl">
            <InitiativeForm
              initialData={editingInitiative}
              onSubmit={handleFormSubmit}
              onCancel={handleCloseForm}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingInitiative}
        title="Eliminar iniciativa"
        message={`¿Estás seguro de que deseas eliminar "${deletingInitiative?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingInitiative(null)}
        loading={deleteLoading}
      />

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  )
}

export default InitiativesPage

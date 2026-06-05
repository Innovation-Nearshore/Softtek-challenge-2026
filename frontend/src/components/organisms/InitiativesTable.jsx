import { useState, useRef, useEffect, useCallback } from 'react'
import Badge from '../atoms/Badge'
import Button from '../atoms/Button'
import Spinner from '../atoms/Spinner'

/**
 * Organism: InitiativesTable
 * Displays initiatives with inline editing for Nombre, Responsable, Prioridad.
 * Other fields remain editable via the full form (onEdit).
 *
 * Inline editing behaviour:
 *  - Click a cell  → becomes an input / select in-place
 *  - Enter or blur → save via onInlineUpdate(id, field, value)
 *  - Escape        → cancel without saving
 */

const PRIORIDADES = ['Alta', 'Media', 'Baja']

/* ─── Sub-components ──────────────────────────────────────────────────────── */

const InlineText = ({ value, onSave, onCancel }) => {
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const commit = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onSave(trimmed)
    else onCancel()
  }, [draft, value, onSave, onCancel])

  const handleKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit() }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKey}
      className="w-full min-w-[120px] px-2 py-1 text-sm border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
    />
  )
}

const InlineSelect = ({ value, onSave, onCancel }) => {
  const selectRef = useRef(null)

  useEffect(() => { selectRef.current?.focus() }, [])

  const handleChange = (e) => {
    const newVal = e.target.value
    if (newVal !== value) onSave(newVal)
    else onCancel()
  }

  const handleKey = (e) => {
    if (e.key === 'Escape') onCancel()
  }

  return (
    <select
      ref={selectRef}
      defaultValue={value}
      onChange={handleChange}
      onBlur={onCancel}
      onKeyDown={handleKey}
      className="px-2 py-1 text-sm border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm cursor-pointer"
    >
      {PRIORIDADES.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  )
}

/**
 * EditableCell – wraps content with a pencil hover indicator.
 * Clicking activates the inline editor.
 */
const EditableCell = ({ children, onActivate, saving }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onActivate}
    onKeyDown={(e) => e.key === 'Enter' && onActivate()}
    title="Haz clic para editar"
    className="group flex items-center gap-1.5 cursor-pointer rounded-md px-1 -mx-1 hover:bg-blue-50 transition-colors"
  >
    {saving ? (
      <Spinner size="sm" />
    ) : (
      <>
        {children}
        <svg
          className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400 flex-shrink-0 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </>
    )}
  </div>
)

/* ─── Main Component ──────────────────────────────────────────────────────── */

const InitiativesTable = ({
  initiatives = [],
  loading = false,
  onEdit,
  onDelete,
  onInlineUpdate,
}) => {
  // activeEdit: { id, field } | null
  const [activeEdit, setActiveEdit] = useState(null)
  // savingCells: Set of `${id}-${field}` strings
  const [savingCells, setSavingCells] = useState(new Set())

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const isOverdue = (dateStr, estado) => {
    if (!dateStr || estado === 'Completado') return false
    return new Date(dateStr) < new Date()
  }

  const activate = (id, field) => setActiveEdit({ id, field })
  const cancel = () => setActiveEdit(null)

  const save = useCallback(
    async (id, field, value) => {
      setActiveEdit(null)
      if (!onInlineUpdate) return
      const key = `${id}-${field}`
      setSavingCells((prev) => new Set(prev).add(key))
      try {
        await onInlineUpdate(id, field, value)
      } finally {
        setSavingCells((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      }
    },
    [onInlineUpdate]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (initiatives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg className="h-16 w-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-base font-medium">No hay iniciativas registradas</p>
        <p className="text-sm mt-1">Crea una nueva iniciativa para comenzar</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            {['Nombre', 'Responsable', 'Estado', 'Prioridad', 'Fecha Límite', 'Acciones'].map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {initiatives.map((initiative) => {
            const overdue = isOverdue(initiative.fecha_limite, initiative.estado)
            const isEditingNombre      = activeEdit?.id === initiative.id && activeEdit?.field === 'nombre'
            const isEditingResponsable = activeEdit?.id === initiative.id && activeEdit?.field === 'responsable'
            const isEditingPrioridad   = activeEdit?.id === initiative.id && activeEdit?.field === 'prioridad'
            const savingNombre      = savingCells.has(`${initiative.id}-nombre`)
            const savingResponsable = savingCells.has(`${initiative.id}-responsable`)
            const savingPrioridad   = savingCells.has(`${initiative.id}-prioridad`)

            return (
              <tr
                key={initiative.id}
                className={`hover:bg-gray-50 transition-colors ${overdue ? 'bg-red-50 hover:bg-red-100' : ''}`}
              >
                {/* ── Nombre (inline editable) ── */}
                <td className="px-4 py-3 max-w-[220px]">
                  {isEditingNombre ? (
                    <InlineText
                      value={initiative.nombre}
                      onSave={(v) => save(initiative.id, 'nombre', v)}
                      onCancel={cancel}
                    />
                  ) : (
                    <EditableCell
                      onActivate={() => activate(initiative.id, 'nombre')}
                      saving={savingNombre}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {overdue && (
                          <span title="Vencida" className="text-red-500 flex-shrink-0">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                        <span className="text-sm font-medium text-gray-900 truncate" title={initiative.nombre}>
                          {initiative.nombre}
                        </span>
                      </div>
                    </EditableCell>
                  )}
                  {initiative.descripcion && !isEditingNombre && (
                    <p className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate pl-1" title={initiative.descripcion}>
                      {initiative.descripcion}
                    </p>
                  )}
                </td>

                {/* ── Responsable (inline editable) ── */}
                <td className="px-4 py-3">
                  {isEditingResponsable ? (
                    <InlineText
                      value={initiative.responsable}
                      onSave={(v) => save(initiative.id, 'responsable', v)}
                      onCancel={cancel}
                    />
                  ) : (
                    <EditableCell
                      onActivate={() => activate(initiative.id, 'responsable')}
                      saving={savingResponsable}
                    >
                      <span className="text-sm text-gray-700">{initiative.responsable}</span>
                    </EditableCell>
                  )}
                </td>

                {/* ── Estado (read-only in table; full form for edits) ── */}
                <td className="px-4 py-3">
                  <Badge type="status" value={initiative.estado} />
                </td>

                {/* ── Prioridad (inline editable) ── */}
                <td className="px-4 py-3">
                  {isEditingPrioridad ? (
                    <InlineSelect
                      value={initiative.prioridad}
                      onSave={(v) => save(initiative.id, 'prioridad', v)}
                      onCancel={cancel}
                    />
                  ) : (
                    <EditableCell
                      onActivate={() => activate(initiative.id, 'prioridad')}
                      saving={savingPrioridad}
                    >
                      <Badge type="priority" value={initiative.prioridad} />
                    </EditableCell>
                  )}
                </td>

                {/* ── Fecha Límite ── */}
                <td className="px-4 py-3">
                  <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                    {formatDate(initiative.fecha_limite)}
                  </span>
                </td>

                {/* ── Acciones ── */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(initiative)}
                      title="Editar completo"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(initiative)}
                      title="Eliminar"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default InitiativesTable

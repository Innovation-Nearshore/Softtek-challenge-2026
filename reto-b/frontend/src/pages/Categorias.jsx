import { useState } from 'react'
import { useCategorias } from '../hooks/useCategorias'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import Modal from '../components/Modal'

const EMPTY_FORM = { nombre: '', descripcion: '', color_hex: '#6366f1' }

/**
 * Categorias page — container component.
 * SRP: handles UI state only; data/async logic delegated to useCategorias hook.
 * DIP: depends on hook abstraction, not concrete API calls.
 */
export default function Categorias() {
  const { categorias, loading, error, success, setError, setSuccess, save, remove } =
    useCategorias()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({
      nombre: c.nombre,
      descripcion: c.descripcion ?? '',
      color_hex: c.color_hex ?? '#6366f1',
    })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await save(editing?.id ?? null, form)
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return
    try {
      await remove(id)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Nueva categoría
        </button>
      </div>

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.length === 0 && (
            <p className="text-gray-400 col-span-3 text-center py-10">
              No hay categorías registradas.
            </p>
          )}
          {categorias.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow p-5 flex flex-col gap-3 border-l-4"
              style={{ borderColor: c.color_hex ?? '#6366f1' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.color_hex ?? '#6366f1' }}
                  />
                  <h3 className="font-semibold text-gray-800">{c.nombre}</h3>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              {c.descripcion && (
                <p className="text-sm text-gray-500 leading-relaxed">{c.descripcion}</p>
              )}
              <p className="text-xs text-gray-400 font-mono">{c.color_hex}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal
          title={editing ? 'Editar categoría' : 'Nueva categoría'}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input
                required
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <textarea
                rows={3}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color_hex}
                  onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border"
                />
                <span className="text-sm text-gray-600 font-mono">{form.color_hex}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useMetricas } from '../hooks/useMetricas'
import { usePeriodos } from '../hooks/usePeriodos'
import { useCategorias } from '../hooks/useCategorias'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import Modal from '../components/Modal'

const EMPTY_FORM = {
  periodo_id: '',
  categoria_id: '',
  nombre_metrica: '',
  valor_actual: '',
  valor_objetivo: '',
  unidad: '',
  notas: '',
}

/**
 * Metricas page — container component.
 * SRP: renders CRUD UI; all data/state logic delegated to hooks.
 * DIP: depends on hook interfaces, not concrete API modules.
 */
export default function Metricas() {
  // Filter state
  const [filterPeriodo, setFilterPeriodo] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')

  // Data hooks
  const filters = {}
  if (filterPeriodo) filters.periodo_id = filterPeriodo
  if (filterCategoria) filters.categoria_id = filterCategoria

  const { metricas, loading, error, success, setError, setSuccess, save, remove, importCSV } =
    useMetricas(filters)
  const { periodos } = usePeriodos()
  const { categorias } = useCategorias()

  // Modal / form state (UI-only, not business logic)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // CSV upload state
  const [showUpload, setShowUpload] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (m) => {
    setEditing(m)
    setForm({
      periodo_id: m.periodo_id,
      categoria_id: m.categoria_id,
      nombre_metrica: m.nombre_metrica,
      valor_actual: m.valor_actual,
      valor_objetivo: m.valor_objetivo ?? '',
      unidad: m.unidad ?? '',
      notas: m.notas ?? '',
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
    if (!window.confirm('¿Eliminar esta métrica?')) return
    try {
      await remove(id)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!csvFile) {
      setError('Selecciona un archivo CSV.')
      return
    }
    setUploading(true)
    try {
      await importCSV(csvFile)
      setShowUpload(false)
      setCsvFile(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  // Lookup maps for display
  const catMap = Object.fromEntries(categorias.map((c) => [c.id, c]))
  const perMap = Object.fromEntries(periodos.map((p) => [p.id, p]))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Métricas</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 text-sm border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            📂 Importar CSV
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Nueva métrica
          </button>
        </div>
      </div>

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterPeriodo}
          onChange={(e) => setFilterPeriodo(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Todos los períodos</option>
          {periodos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre_mes} {p.anio}
            </option>
          ))}
        </select>
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Métrica</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-left">Período</th>
                <th className="px-4 py-3 text-right">Actual</th>
                <th className="px-4 py-3 text-right">Objetivo</th>
                <th className="px-4 py-3 text-left">Unidad</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {metricas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No hay métricas registradas.
                  </td>
                </tr>
              )}
              {metricas.map((m) => {
                const cat = catMap[m.categoria_id]
                const per = perMap[m.periodo_id]
                return (
                  <tr key={m.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{m.nombre_metrica}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        {(m.categoria_color ?? cat?.color_hex) && (
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: m.categoria_color ?? cat?.color_hex }}
                          />
                        )}
                        {m.categoria_nombre ?? cat?.nombre ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {m.nombre_mes
                        ? `${m.nombre_mes} ${m.anio}`
                        : per
                        ? `${per.nombre_mes} ${per.anio}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">{m.valor_actual}</td>
                    <td className="px-4 py-3 text-right">{m.valor_objetivo ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{m.unidad ?? '—'}</td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button
                        onClick={() => openEdit(m)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <Modal
          title={editing ? 'Editar métrica' : 'Nueva métrica'}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Período *</label>
                <select
                  required
                  value={form.periodo_id}
                  onChange={(e) => setForm({ ...form, periodo_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">Seleccionar…</option>
                  {periodos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre_mes} {p.anio}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Categoría *</label>
                <select
                  required
                  value={form.categoria_id}
                  onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">Seleccionar…</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nombre de la métrica *
              </label>
              <input
                required
                type="text"
                value={form.nombre_metrica}
                onChange={(e) => setForm({ ...form, nombre_metrica: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Valor actual *
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  value={form.valor_actual}
                  onChange={(e) => setForm({ ...form, valor_actual: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Valor objetivo
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.valor_objetivo}
                  onChange={(e) => setForm({ ...form, valor_objetivo: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unidad</label>
              <input
                type="text"
                value={form.unidad}
                onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                placeholder="ej. %, unidades, $"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
              <textarea
                rows={3}
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
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

      {/* CSV Upload Modal */}
      {showUpload && (
        <Modal title="Importar métricas desde CSV" onClose={() => setShowUpload(false)}>
          <form onSubmit={handleUpload} className="space-y-4">
            <p className="text-sm text-gray-500">
              El archivo CSV debe contener las columnas:{' '}
              <code className="bg-gray-100 px-1 rounded text-xs">
                anio, mes, categoria_nombre, nombre_metrica, valor_actual, valor_objetivo
                (opcional), unidad (opcional), notas (opcional)
              </code>
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Archivo CSV *
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                className="w-full text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {uploading ? 'Importando…' : 'Importar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

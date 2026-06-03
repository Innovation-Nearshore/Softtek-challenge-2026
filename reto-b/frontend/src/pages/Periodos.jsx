import { useState } from 'react'
import { usePeriodos } from '../hooks/usePeriodos'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import Modal from '../components/Modal'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const EMPTY_FORM = {
  anio: new Date().getFullYear(),
  mes: new Date().getMonth() + 1,
  nombre_mes: MESES[new Date().getMonth()],
  trimestre: Math.ceil((new Date().getMonth() + 1) / 3),
  fecha_inicio: '',
  fecha_fin: '',
}

/**
 * Periodos page — container component.
 * SRP: handles UI state only; data/async logic delegated to usePeriodos hook.
 * DIP: depends on hook abstraction, not concrete API calls.
 */
export default function Periodos() {
  const { periodos, loading, error, success, setError, setSuccess, save, remove } = usePeriodos()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const handleMesChange = (mes) => {
    const m = parseInt(mes, 10)
    setForm((f) => ({
      ...f,
      mes: m,
      nombre_mes: MESES[m - 1],
      trimestre: Math.ceil(m / 3),
    }))
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await save(form)
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este período? También se eliminarán sus métricas asociadas.'))
      return
    try {
      await remove(id)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Períodos</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Nuevo período
        </button>
      </div>

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Período</th>
                <th className="px-4 py-3 text-center">Trimestre</th>
                <th className="px-4 py-3 text-left">Fecha inicio</th>
                <th className="px-4 py-3 text-left">Fecha fin</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {periodos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No hay períodos registrados.
                  </td>
                </tr>
              )}
              {periodos.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {p.nombre_mes} {p.anio}
                  </td>
                  <td className="px-4 py-3 text-center">Q{p.trimestre}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Nuevo período" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Año *</label>
                <input
                  required
                  type="number"
                  min="2000"
                  max="2100"
                  value={form.anio}
                  onChange={(e) => setForm({ ...form, anio: parseInt(e.target.value, 10) })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mes *</label>
                <select
                  required
                  value={form.mes}
                  onChange={(e) => handleMesChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {MESES.map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  value={form.fecha_inicio}
                  onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha fin</label>
                <input
                  type="date"
                  value={form.fecha_fin}
                  onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
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

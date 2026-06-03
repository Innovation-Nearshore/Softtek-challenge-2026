import { useState } from 'react'
import { usePeriodos } from '../hooks/usePeriodos'
import { useCategorias } from '../hooks/useCategorias'
import Alert from '../components/Alert'

/**
 * Reporte page — container component.
 * SRP: manages only PDF-download interaction; data sourced from hooks.
 * DIP: depends on hook abstractions for period/category data.
 */
export default function Reporte() {
  const { periodos, error: periodosError } = usePeriodos()
  const { categorias, error: categoriasError } = useCategorias()

  const [periodoId, setPeriodoId] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const dataError = periodosError || categoriasError

  const handleDownload = async () => {
    if (!periodoId) {
      setError('Selecciona un período para generar el reporte.')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const params = new URLSearchParams({ periodo_id: periodoId })
      if (categoriaId) params.append('categoria_id', categoriaId)

      const res = await fetch(`/api/reporte/pdf?${params.toString()}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || `Error ${res.status}`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const periodo = periodos.find((p) => String(p.id) === String(periodoId))
      a.download = `reporte_${periodo ? `${periodo.nombre_mes}_${periodo.anio}` : periodoId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setSuccess('Reporte descargado correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-800">Generar Reporte PDF</h1>

      <Alert message={dataError || error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="bg-white rounded-xl shadow p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período <span className="text-red-500">*</span>
          </label>
          <select
            value={periodoId}
            onChange={(e) => setPeriodoId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Selecciona un período…</option>
            {periodos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre_mes} {p.anio}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría (opcional — omitir para reporte global)
          </label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t pt-4">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Generando…
              </>
            ) : (
              <>📄 Descargar PDF</>
            )}
          </button>
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <p>El reporte incluye:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Resumen de métricas por categoría</li>
            <li>Valores actuales y objetivos</li>
            <li>Porcentaje de cumplimiento</li>
            <li>Notas adicionales</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

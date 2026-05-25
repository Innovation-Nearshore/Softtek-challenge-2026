import { useState, useEffect, useCallback, Fragment } from 'react'
import type { FormEvent } from 'react'
import './App.css'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Categoria {
  id: number
  nombre: string
}

interface Incidente {
  id: number
  titulo: string
  descripcion: string | null
  severidad: string
  estado: string
  area_afectada: string
  reportador: string | null
  categoria_id: number | null
  categoria: string | null
  fecha_creacion: string
}

interface LogEntry {
  id: number
  incident_id: number
  old_status: string | null
  new_status: string
  note: string | null
  changed_at: string
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

function severidadBadge(s: string) {
  const map: Record<string, string> = {
    'Crítica': 'bg-red-600 text-white',
    'Alta':    'bg-orange-500 text-white',
    'Media':   'bg-yellow-400 text-gray-900',
    'Baja':    'bg-gray-200 text-gray-700',
  }
  return map[s] ?? 'bg-gray-100 text-gray-600'
}

function estadoBadge(e: string) {
  const map: Record<string, string> = {
    'Abierto':     'bg-orange-500 text-white',
    'En atención': 'bg-blue-500 text-white',
    'Cerrado':     'bg-green-600 text-white',
  }
  return map[e] ?? 'bg-gray-200 text-gray-700'
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  // Data state
  const [incidentes, setIncidentes] = useState<Incidente[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Filters
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [filtroSeveridad, setFiltroSeveridad] = useState('Todas')

  // Expanded log row
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [logs, setLogs] = useState<Record<number, LogEntry[]>>({})
  const [loadingLog, setLoadingLog] = useState<number | null>(null)

  // Status update loading
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // Form state
  const initialForm = {
    titulo: '',
    severidad: '',
    area_afectada: '',
    categoria_id: '',
    descripcion: '',
    reportador: '',
  }
  const [form, setForm] = useState(initialForm)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // ── Fetch incidents ──────────────────────────────────────────────────────────
  const fetchIncidentes = useCallback(async () => {
    try {
      const res = await fetch('/api/incidentes')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data: Incidente[] = await res.json()
      setIncidentes(data)
      setFetchError(null)
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Error al cargar incidentes')
    }
  }, [])

  // ── Fetch categories ─────────────────────────────────────────────────────────
  const fetchCategorias = useCallback(async () => {
    try {
      const res = await fetch('/api/categorias')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data: Categoria[] = await res.json()
      setCategorias(data)
    } catch {
      // categories are optional; fail silently
    }
  }, [])

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([fetchIncidentes(), fetchCategorias()]).finally(() => setLoading(false))
  }, [fetchIncidentes, fetchCategorias])

  // ── Filtered data ────────────────────────────────────────────────────────────
  const filtered = incidentes.filter(i => {
    const byEstado = filtroEstado === 'Todos' || i.estado === filtroEstado
    const bySev = filtroSeveridad === 'Todas' || i.severidad === filtroSeveridad
    return byEstado && bySev
  })

  // ── Dashboard counters ───────────────────────────────────────────────────────
  const countAbierto    = incidentes.filter(i => i.estado === 'Abierto').length
  const countEnAtencion = incidentes.filter(i => i.estado === 'En atención').length
  const countCerrado    = incidentes.filter(i => i.estado === 'Cerrado').length

  // ── Critical open incidents ──────────────────────────────────────────────────
  const criticos = incidentes.filter(i => i.severidad === 'Crítica' && i.estado === 'Abierto')

  // ── Form validation ──────────────────────────────────────────────────────────
  function validate() {
    const errors: Record<string, string> = {}
    if (!form.titulo.trim())        errors.titulo        = 'El título es obligatorio.'
    if (!form.severidad)            errors.severidad     = 'La severidad es obligatoria.'
    if (!form.area_afectada)        errors.area_afectada = 'El área afectada es obligatoria.'
    return errors
  }

  // ── Form submit ──────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    setSubmitting(true)
    try {
      const body = {
        titulo:       form.titulo.trim(),
        severidad:    form.severidad,
        area_afectada: form.area_afectada,
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
        descripcion:  form.descripcion.trim() || null,
        reportador:   form.reportador.trim() || null,
      }
      const res = await fetch('/api/incidentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error ${res.status}`)
      }
      setForm(initialForm)
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)
      await fetchIncidentes()
    } catch (err) {
      setFormErrors({ submit: err instanceof Error ? err.message : 'Error al registrar el incidente.' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Inline status change ─────────────────────────────────────────────────────
  async function handleEstadoChange(id: number, newEstado: string) {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/incidentes/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newEstado }),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      await fetchIncidentes()
      // Refresh log if this incident's log is expanded
      if (expandedId === id) {
        await fetchLog(id)
      }
    } catch {
      // silent – UI will reflect old state after refresh
    } finally {
      setUpdatingId(null)
    }
  }

  // ── Fetch log ────────────────────────────────────────────────────────────────
  async function fetchLog(id: number) {
    setLoadingLog(id)
    try {
      const res = await fetch(`/api/incidentes/${id}/log`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data: LogEntry[] = await res.json()
      setLogs(prev => ({ ...prev, [id]: data }))
    } catch {
      setLogs(prev => ({ ...prev, [id]: [] }))
    } finally {
      setLoadingLog(null)
    }
  }

  // ── Toggle log expansion ─────────────────────────────────────────────────────
  async function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (!logs[id]) {
      await fetchLog(id)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── Header ── */}
      <header className="bg-indigo-700 text-white py-4 px-6 shadow">
        <h1 className="text-2xl font-bold tracking-wide">📋 Registro de Incidentes</h1>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── Registration Form ── */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Registrar Nuevo Incidente</h2>
          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Título */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${formErrors.titulo ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Describe brevemente el incidente"
              />
              {formErrors.titulo && <span className="text-red-600 text-xs">{formErrors.titulo}</span>}
            </div>

            {/* Severidad */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Severidad <span className="text-red-500">*</span>
              </label>
              <select
                value={form.severidad}
                onChange={e => setForm(f => ({ ...f, severidad: e.target.value }))}
                className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${formErrors.severidad ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">-- Selecciona severidad --</option>
                <option value="Crítica">Crítica</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
              {formErrors.severidad && <span className="text-red-600 text-xs">{formErrors.severidad}</span>}
            </div>

            {/* Área Afectada */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Área Afectada <span className="text-red-500">*</span>
              </label>
              <select
                value={form.area_afectada}
                onChange={e => setForm(f => ({ ...f, area_afectada: e.target.value }))}
                className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${formErrors.area_afectada ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">-- Selecciona área --</option>
                <option value="Área A">Área A</option>
                <option value="Área B">Área B</option>
                <option value="Área C">Área C</option>
                <option value="Área D">Área D</option>
                <option value="Área E">Área E</option>
                <option value="Área F">Área F</option>
              </select>
              {formErrors.area_afectada && <span className="text-red-600 text-xs">{formErrors.area_afectada}</span>}
            </div>

            {/* Categoría */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Categoría</label>
              <select
                value={form.categoria_id}
                onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">-- Sin categoría --</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            {/* Reportador */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Reportador</label>
              <input
                type="text"
                value={form.reportador}
                onChange={e => setForm(f => ({ ...f, reportador: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Nombre del reportador"
              />
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                rows={3}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                placeholder="Detalles adicionales del incidente..."
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex items-center gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm"
              >
                {submitting ? 'Registrando...' : 'Registrar Incidente'}
              </button>
              {submitSuccess && (
                <span className="text-green-600 text-sm font-medium">✅ Incidente registrado exitosamente</span>
              )}
              {formErrors.submit && (
                <span className="text-red-600 text-sm">{formErrors.submit}</span>
              )}
            </div>
          </form>
        </section>

        {/* ── Dashboard Counters ── */}
        <section className="grid grid-cols-3 gap-4">
          <div className="bg-orange-500 text-white rounded-xl shadow p-5 text-center">
            <p className="text-sm font-medium uppercase tracking-wide opacity-90">Abierto</p>
            <p className="text-5xl font-bold mt-1">{countAbierto}</p>
          </div>
          <div className="bg-blue-500 text-white rounded-xl shadow p-5 text-center">
            <p className="text-sm font-medium uppercase tracking-wide opacity-90">En Atención</p>
            <p className="text-5xl font-bold mt-1">{countEnAtencion}</p>
          </div>
          <div className="bg-green-600 text-white rounded-xl shadow p-5 text-center">
            <p className="text-sm font-medium uppercase tracking-wide opacity-90">Cerrado</p>
            <p className="text-5xl font-bold mt-1">{countCerrado}</p>
          </div>
        </section>

        {/* ── Critical Alert Banner ── */}
        {criticos.length > 0 && (
          <div className="bg-red-600 text-white rounded-xl shadow p-4 flex gap-3 items-start">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-bold text-lg">¡Alerta! Incidentes Críticos Abiertos</p>
              <ul className="mt-1 list-disc list-inside text-sm space-y-0.5">
                {criticos.map(i => (
                  <li key={i.id}><span className="font-semibold">#{i.id}</span> — {i.titulo}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Filters ── */}
        <section className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Estado:</span>
            {['Todos', 'Abierto', 'En atención', 'Cerrado'].map(e => (
              <button
                key={e}
                onClick={() => setFiltroEstado(e)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filtroEstado === e
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Severidad:</span>
            {['Todas', 'Crítica', 'Alta', 'Media', 'Baja'].map(s => (
              <button
                key={s}
                onClick={() => setFiltroSeveridad(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filtroSeveridad === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* ── Incidents Table ── */}
        <section className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Lista de Incidentes</h2>
            <span className="text-sm text-gray-500">{filtered.length} resultado(s)</span>
          </div>

          {fetchError && (
            <div className="p-6 text-red-600 text-center">{fetchError}</div>
          )}

          {loading ? (
            <div className="p-12 text-center text-gray-500">Cargando incidentes...</div>
          ) : filtered.length === 0 && !fetchError ? (
            <div className="p-12 text-center text-gray-400">No hay incidentes que coincidan con los filtros.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['ID', 'Título', 'Categoría', 'Severidad', 'Área Afectada', 'Estado', 'Fecha Creación', 'Historial'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(inc => (
                    <Fragment key={inc.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 font-mono">#{inc.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                          <div className="truncate" title={inc.titulo}>{inc.titulo}</div>
                          {inc.reportador && (
                            <div className="text-xs text-gray-400 mt-0.5">por {inc.reportador}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{inc.categoria ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${severidadBadge(inc.severidad)}`}>
                            {inc.severidad}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{inc.area_afectada}</td>
                        <td className="px-4 py-3">
                          <select
                            value={inc.estado}
                            disabled={updatingId === inc.id}
                            onChange={e => handleEstadoChange(inc.id, e.target.value)}
                            className={`border rounded px-2 py-1 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400 ${estadoBadge(inc.estado)} ${updatingId === inc.id ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            <option value="Abierto">Abierto</option>
                            <option value="En atención">En atención</option>
                            <option value="Cerrado">Cerrado</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(inc.fecha_creacion)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleExpand(inc.id)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium underline whitespace-nowrap"
                          >
                            {expandedId === inc.id ? 'Ocultar' : 'Ver log'}
                          </button>
                        </td>
                      </tr>

                      {/* ── Log sub-row ── */}
                      {expandedId === inc.id && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 bg-indigo-50 border-t border-indigo-100">
                            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">
                              Historial de cambios — #{inc.id} {inc.titulo}
                            </p>
                            {loadingLog === inc.id ? (
                              <p className="text-sm text-gray-500">Cargando historial...</p>
                            ) : (logs[inc.id] ?? []).length === 0 ? (
                              <p className="text-sm text-gray-400">Sin registros en el historial.</p>
                            ) : (
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr className="text-left text-gray-500 border-b border-indigo-200">
                                    <th className="pb-1 pr-4">Fecha</th>
                                    <th className="pb-1 pr-4">Estado anterior</th>
                                    <th className="pb-1 pr-4">Estado nuevo</th>
                                    <th className="pb-1">Nota</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-100">
                                  {(logs[inc.id] ?? []).map(entry => (
                                    <tr key={entry.id} className="text-gray-700">
                                      <td className="py-1 pr-4 whitespace-nowrap">{formatDate(entry.changed_at)}</td>
                                      <td className="py-1 pr-4">
                                        {entry.old_status
                                          ? <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${estadoBadge(entry.old_status)}`}>{entry.old_status}</span>
                                          : <span className="text-gray-400 italic">—</span>
                                        }
                                      </td>
                                      <td className="py-1 pr-4">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${estadoBadge(entry.new_status)}`}>
                                          {entry.new_status}
                                        </span>
                                      </td>
                                      <td className="py-1 text-gray-500">{entry.note ?? '—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

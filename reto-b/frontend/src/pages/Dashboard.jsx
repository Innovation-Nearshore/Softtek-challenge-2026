import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { usePeriodos } from '../hooks/usePeriodos'
import { useResumen } from '../hooks/useMetricas'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
)

/**
 * Dashboard page — presentational container.
 * SRP: only renders layout; data concerns delegated to hooks.
 * DIP: depends on hook abstractions, not direct API calls.
 */
export default function Dashboard() {
  const { periodos, error: periodosError } = usePeriodos()
  const [periodoId, setPeriodoId] = useState('')

  // Set default period once periods load
  useEffect(() => {
    if (periodos.length > 0 && !periodoId) {
      setPeriodoId(String(periodos[0].id))
    }
  }, [periodos, periodoId])

  const filters = periodoId ? { periodo_id: periodoId } : {}
  const { resumen, loading, error: resumenError } = useResumen(filters)

  const categorias = Array.isArray(resumen) ? resumen : []
  const errorMsg = periodosError || resumenError

  const totalMetricas = categorias.reduce((s, c) => s + Number(c.total_metricas), 0)
  const cumplimiento =
    categorias.length > 0
      ? Math.round(
          categorias.reduce((s, c) => s + Number(c.porcentaje_cumplimiento ?? 0), 0) /
            categorias.length
        )
      : 0

  const barData = {
    labels: categorias.map((c) => c.categoria),
    datasets: [
      {
        label: 'Valor actual promedio',
        data: categorias.map((c) => Number(c.valor_actual_promedio ?? 0)),
        backgroundColor: categorias.map((c) => c.color_hex ?? '#6366f1'),
        borderRadius: 6,
      },
      {
        label: 'Valor objetivo promedio',
        data: categorias.map((c) => Number(c.valor_objetivo_promedio ?? 0)),
        backgroundColor: 'rgba(0,0,0,0.08)',
        borderRadius: 6,
      },
    ],
  }

  const doughnutData = {
    labels: categorias.map((c) => c.categoria),
    datasets: [
      {
        data: categorias.map((c) => Number(c.total_metricas)),
        backgroundColor: categorias.map((c) => c.color_hex ?? '#6366f1'),
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <select
          value={periodoId}
          onChange={(e) => setPeriodoId(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {periodos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre_mes} {p.anio}
            </option>
          ))}
        </select>
      </div>

      <Alert message={errorMsg} />

      {loading && <Spinner />}

      {!loading && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label="Total de métricas" value={totalMetricas} icon="📈" />
            <KpiCard label="Categorías activas" value={categorias.length} icon="🗂️" />
            <KpiCard label="Cumplimiento promedio" value={`${cumplimiento}%`} icon="✅" />
          </div>

          {/* Charts */}
          {categorias.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-5">
                <h2 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
                  Actual vs Objetivo por categoría
                </h2>
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>

              <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
                <h2 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide self-start">
                  Distribución de métricas
                </h2>
                <div className="w-64">
                  <Doughnut
                    data={doughnutData}
                    options={{ plugins: { legend: { position: 'bottom' } } }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary Table */}
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-right">Métricas</th>
                  <th className="px-4 py-3 text-right">Actual prom.</th>
                  <th className="px-4 py-3 text-right">Objetivo prom.</th>
                  <th className="px-4 py-3 text-right">Cumplimiento</th>
                </tr>
              </thead>
              <tbody>
                {categorias.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      {periodoId
                        ? 'No hay métricas para este período.'
                        : 'Selecciona un período para ver el resumen.'}
                    </td>
                  </tr>
                )}
                {categorias.map((c, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: c.color_hex ?? '#6366f1' }}
                      />
                      {c.categoria}
                    </td>
                    <td className="px-4 py-3 text-right">{c.total_metricas}</td>
                    <td className="px-4 py-3 text-right">
                      {Number(c.valor_actual_promedio ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {Number(c.valor_objetivo_promedio ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {Number(c.porcentaje_cumplimiento ?? 0).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

/** Presentational KPI card — pure component (no state). */
function KpiCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">{label}</p>
      </div>
    </div>
  )
}

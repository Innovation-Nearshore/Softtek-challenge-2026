/**
 * ContadoresEstado.jsx
 * Displays dynamic summary cards with counts per estado and prioridad.
 * All counts are derived from live API data — no hardcoded values.
 */

const ESTADO_CONFIG = [
  {
    key: 'Pendiente',
    label: 'Pendiente',
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'En curso',
    label: 'En Curso',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    key: 'Completado',
    label: 'Completado',
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const PRIORIDAD_CONFIG = [
  {
    key: 'Alta',
    label: 'Alta',
    dot: 'bg-red-500',
    text: 'text-red-700',
    bg: 'bg-red-50',
  },
  {
    key: 'Media',
    label: 'Media',
    dot: 'bg-orange-400',
    text: 'text-orange-700',
    bg: 'bg-orange-50',
  },
  {
    key: 'Baja',
    label: 'Baja',
    dot: 'bg-gray-400',
    text: 'text-gray-600',
    bg: 'bg-gray-50',
  },
];

/**
 * @param {{ iniciativas: Array }} props
 */
const ContadoresEstado = ({ iniciativas = [] }) => {
  const total = iniciativas.length;

  // Dynamic counts per estado
  const countByEstado = ESTADO_CONFIG.reduce((acc, { key }) => {
    acc[key] = iniciativas.filter((i) => i.estado === key).length;
    return acc;
  }, {});

  // Dynamic counts per prioridad
  const countByPrioridad = PRIORIDAD_CONFIG.reduce((acc, { key }) => {
    acc[key] = iniciativas.filter((i) => i.prioridad === key).length;
    return acc;
  }, {});

  return (
    <section aria-label="Resumen de iniciativas" className="space-y-4">
      {/* Top row — Estado cards + Total */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Total */}
        <div className="col-span-2 sm:col-span-1 flex items-center gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 shrink-0">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">Total</p>
            <p className="text-3xl font-bold text-indigo-700">{total}</p>
          </div>
        </div>

        {/* Per-estado cards */}
        {ESTADO_CONFIG.map(({ key, label, bg, border, text, icon }) => (
          <div
            key={key}
            className={`flex items-center gap-4 rounded-2xl border ${border} ${bg} px-5 py-4 shadow-sm`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-60 ${text} shrink-0`}>
              {icon}
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-wide ${text} opacity-80`}>{label}</p>
              <p className={`text-3xl font-bold ${text}`}>{countByEstado[key]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row — Prioridad mini-chips */}
      <div className="flex flex-wrap gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 self-center mr-1">
          Por prioridad:
        </span>
        {PRIORIDAD_CONFIG.map(({ key, label, dot, text, bg }) => (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 rounded-full ${bg} px-3 py-1 text-sm font-medium ${text} border border-transparent`}
          >
            <span className={`h-2 w-2 rounded-full ${dot} shrink-0`} />
            {label}: <strong>{countByPrioridad[key]}</strong>
          </span>
        ))}
      </div>
    </section>
  );
};

export default ContadoresEstado;

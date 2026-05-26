import React, { useMemo } from 'react';

const ESTADOS = ['Recibida', 'En revisión', 'Resuelta'];
const URGENCIAS = ['Alta', 'Media', 'Baja'];

const ESTADO_COLORS = {
  Recibida: 'bg-blue-50 border-blue-200 text-blue-700',
  'En revisión': 'bg-orange-50 border-orange-200 text-orange-700',
  Resuelta: 'bg-green-50 border-green-200 text-green-700',
};

const URGENCIA_COLORS = {
  Alta: 'bg-red-50 border-red-200 text-red-700',
  Media: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  Baja: 'bg-green-50 border-green-200 text-green-700',
};

const ESTADO_ICONS = {
  Recibida: '📥',
  'En revisión': '🔄',
  Resuelta: '✅',
};

const URGENCIA_ICONS = {
  Alta: '🔴',
  Media: '🟡',
  Baja: '🟢',
};

export default function Dashboard({ requests }) {
  const metrics = useMemo(() => {
    const total = requests.length;
    const byEstado = {};
    const byUrgencia = {};

    ESTADOS.forEach((e) => { byEstado[e] = 0; });
    URGENCIAS.forEach((u) => { byUrgencia[u] = 0; });

    requests.forEach((r) => {
      const estado = r.status || r.estado;
      if (byEstado[estado] !== undefined) byEstado[estado]++;
      if (byUrgencia[r.urgencia] !== undefined) byUrgencia[r.urgencia]++;
    });

    return { total, byEstado, byUrgencia };
  }, [requests]);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-700 mb-3">📊 Dashboard de Métricas</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col items-center col-span-2 md:col-span-1">
          <span className="text-3xl font-bold text-gray-800">{metrics.total}</span>
          <span className="text-xs text-gray-500 mt-1 text-center">Total Solicitudes</span>
        </div>

        {/* Por Estado */}
        {ESTADOS.map((estado) => (
          <div
            key={estado}
            className={`border rounded-xl p-4 shadow-sm flex flex-col items-center ${ESTADO_COLORS[estado]}`}
          >
            <span className="text-2xl font-bold">{metrics.byEstado[estado]}</span>
            <span className="text-xs mt-1 text-center">
              {ESTADO_ICONS[estado]} {estado}
            </span>
          </div>
        ))}

        {/* Por Urgencia */}
        {URGENCIAS.map((urgencia) => (
          <div
            key={urgencia}
            className={`border rounded-xl p-4 shadow-sm flex flex-col items-center ${URGENCIA_COLORS[urgencia]}`}
          >
            <span className="text-2xl font-bold">{metrics.byUrgencia[urgencia]}</span>
            <span className="text-xs mt-1 text-center">
              {URGENCIA_ICONS[urgencia]} {urgencia}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

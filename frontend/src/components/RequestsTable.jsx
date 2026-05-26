import { useState } from 'react';
import { updateRequestStatus } from '../services/requestsService';

const URGENCY_COLORS = {
  Alta: 'bg-red-100 text-red-700',
  Media: 'bg-yellow-100 text-yellow-700',
  Baja: 'bg-green-100 text-green-700',
};

const ESTADOS = ['Recibida', 'En revisión', 'Resuelta', 'Rechazada', 'Cancelada'];

const COLUMNS = [
  'Ticket',
  'Título',
  'Tipo',
  'Urgencia',
  'Estado',
  'Solicitante',
  'Área',
  'Fecha',
];

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('es-CO') : '—';

function StatusSelect({ request, onUpdated }) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = async (e) => {
    const newEstado = e.target.value;
    setUpdating(true);
    setError(null);
    try {
      await updateRequestStatus(request.id, newEstado);
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <select
        value={request.estado}
        onChange={handleChange}
        disabled={updating}
        className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-50"
      >
        {ESTADOS.map((estado) => (
          <option key={estado} value={estado}>
            {estado}
          </option>
        ))}
      </select>
      {updating && <span className="text-xs text-gray-400">Guardando...</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export default function RequestsTable({ requests, onStatusUpdated }) {
  if (!requests.length) {
    return (
      <p className="text-center text-gray-400 py-10">
        No hay solicitudes registradas.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl shadow">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            {COLUMNS.map((col) => (
              <th key={col} className="px-4 py-3 text-left font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-gray-500 whitespace-nowrap">
                {req.numero_ticket}
              </td>
              <td className="px-4 py-3 text-gray-800 max-w-xs truncate">
                {req.titulo}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {req.tipo_solicitud}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    URGENCY_COLORS[req.urgencia] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {req.urgencia}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusSelect request={req} onUpdated={onStatusUpdated} />
              </td>
              <td className="px-4 py-3 text-gray-700">{req.solicitante}</td>
              <td className="px-4 py-3 text-gray-700">
                {req.area_solicitante}
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {formatDate(req.fecha_creacion)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { updateStatus } from '../services/api';

const ESTADOS = ['Recibida', 'En revisión', 'Resuelta'];

const URGENCIA_BADGE = {
  Alta: 'bg-red-100 text-red-700 border border-red-300',
  Media: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  Baja: 'bg-green-100 text-green-700 border border-green-300',
};

const ESTADO_BADGE = {
  Recibida: 'bg-blue-100 text-blue-700',
  'En revisión': 'bg-orange-100 text-orange-700',
  Resuelta: 'bg-green-100 text-green-700',
};

const TIPOS = [
  'Soporte Técnico',
  'Solicitud de Acceso',
  'Requerimiento de Software',
  'Incidente',
  'Consulta',
  'Mantenimiento',
];

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function RequestsTable({ requests, loading, error, onStatusChange, onRowClick }) {
  const [filterTipo, setFilterTipo] = useState('');
  const [filterUrgencia, setFilterUrgencia] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = useCallback(async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateStatus(id, newStatus);
      if (onStatusChange) onStatusChange();
    } catch (err) {
      alert('Error al actualizar estado: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  }, [onStatusChange]);

  const filtered = requests.filter((r) => {
    if (filterTipo && r.tipo !== filterTipo) return false;
    if (filterUrgencia && r.urgencia !== filterUrgencia) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-800">📋 Bandeja de Solicitudes</h2>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Filtro por tipo */}
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Filtro por urgencia */}
          <div className="flex gap-1">
            {['', 'Alta', 'Media', 'Baja'].map((u) => (
              <button
                key={u}
                onClick={() => setFilterUrgencia(u)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  filterUrgencia === u
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {u === '' ? 'Todas' : u}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-500 ml-2">
            {filtered.length} de {requests.length} solicitudes
          </span>
        </div>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-500">
          <div className="inline-block animate-spin text-3xl mb-2">⏳</div>
          <p>Cargando solicitudes...</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-10 text-red-500">
          <p>❌ {error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p>No hay solicitudes que mostrar.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-xs">
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Urgencia</th>
                <th className="px-3 py-2 text-left">Descripción</th>
                <th className="px-3 py-2 text-left">Solicitante</th>
                <th className="px-3 py-2 text-left">Área</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => onRowClick && onRowClick(r)}
                >
                  <td className="px-3 py-2 text-gray-500 font-mono text-xs">#{r.id}</td>
                  <td className="px-3 py-2 text-gray-700">{r.tipo}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${URGENCIA_BADGE[r.urgencia] || 'bg-gray-100 text-gray-600'}`}>
                      {r.urgencia}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600 max-w-xs">
                    <span title={r.descripcion}>
                      {r.descripcion?.length > 60 ? r.descripcion.substring(0, 60) + '...' : r.descripcion}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700">{r.solicitante}</td>
                  <td className="px-3 py-2 text-gray-700">{r.area}</td>
                  <td
                    className="px-3 py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={r.status || r.estado || ''}
                      disabled={updatingId === r.id}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer ${
                        ESTADO_BADGE[r.status || r.estado] || 'bg-gray-100 text-gray-600'
                      } ${updatingId === r.id ? 'opacity-50' : ''}`}
                    >
                      {ESTADOS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(r.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

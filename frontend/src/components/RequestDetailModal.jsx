import React, { useEffect, useState, useCallback } from 'react';
import { fetchRequestById, fetchHistorial } from '../services/api';

const URGENCIA_BADGE = {
  Alta: 'bg-red-100 text-red-700',
  Media: 'bg-yellow-100 text-yellow-700',
  Baja: 'bg-green-100 text-green-700',
};

const ESTADO_BADGE = {
  Recibida: 'bg-blue-100 text-blue-700',
  'En revisión': 'bg-orange-100 text-orange-700',
  Resuelta: 'bg-green-100 text-green-700',
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function RequestDetailModal({ requestId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    setError('');
    try {
      const [detailData, historialData] = await Promise.all([
        fetchRequestById(requestId),
        fetchHistorial(requestId),
      ]);
      setDetail(detailData);
      setHistorial(Array.isArray(historialData) ? historialData : []);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cerrar con ESC
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">🔍 Detalle de Solicitud</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none font-bold transition-colors"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-4">
          {loading && (
            <div className="text-center py-10 text-gray-500">
              <p>Cargando...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-10 text-red-500">
              <p>❌ {error}</p>
            </div>
          )}

          {!loading && !error && detail && (
            <>
              {/* Detalle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">ID</p>
                  <p className="text-gray-800 font-mono">#{detail.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tipo</p>
                  <p className="text-gray-800">{detail.tipo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Urgencia</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${URGENCIA_BADGE[detail.urgencia] || 'bg-gray-100 text-gray-600'}`}>
                    {detail.urgencia}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Estado</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_BADGE[detail.status || detail.estado] || 'bg-gray-100 text-gray-600'}`}>
                    {detail.status || detail.estado}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Solicitante</p>
                  <p className="text-gray-800">{detail.solicitante}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Área</p>
                  <p className="text-gray-800">{detail.area}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Creada</p>
                  <p className="text-gray-800 text-sm">{formatDate(detail.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Actualizada</p>
                  <p className="text-gray-800 text-sm">{formatDate(detail.updated_at)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Descripción</p>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">
                    {detail.descripcion}
                  </p>
                </div>
              </div>

              {/* Historial */}
              <div>
                <h3 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
                  📜 Historial de Cambios
                  <span className="text-xs font-normal text-gray-400">({historial.length} registros)</span>
                </h3>
                {historial.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">Sin cambios de estado registrados.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 uppercase text-xs">
                          <th className="px-3 py-2 text-left">Estado Anterior</th>
                          <th className="px-3 py-2 text-left">Nuevo Estado</th>
                          <th className="px-3 py-2 text-left">Fecha y Hora</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historial.map((h, idx) => (
                          <tr key={h.id || idx} className="border-t border-gray-100">
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_BADGE[h.old_status] || 'bg-gray-100 text-gray-600'}`}>
                                {h.old_status || '-'}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_BADGE[h.new_status] || 'bg-gray-100 text-gray-600'}`}>
                                {h.new_status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">
                              {formatDate(h.changed_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

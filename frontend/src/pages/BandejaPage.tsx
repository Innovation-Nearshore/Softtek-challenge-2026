import React, { useCallback, useEffect, useState } from 'react';
import type { Request, RequestFilters, RequestStatus, Urgency } from '../types/request';
import { requestService } from '../services/requestService';
import RequestDetailModal from '../components/RequestDetailModal';

const REQUEST_TYPES = [
  'Soporte técnico',
  'Aprobación',
  'Requerimiento',
  'Consulta',
  'Incidente',
  'Mejora',
  'Otro',
];

const URGENCY_OPTIONS: Urgency[] = ['Alta', 'Media', 'Baja'];
const STATUS_OPTIONS: RequestStatus[] = ['Recibida', 'En revisión', 'Resuelta'];

const URGENCY_BADGE: Record<Urgency, string> = {
  Alta: 'bg-red-100 text-red-700 border border-red-200',
  Media: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Baja: 'bg-green-100 text-green-700 border border-green-200',
};

const STATUS_BADGE: Record<RequestStatus, string> = {
  Recibida: 'bg-blue-100 text-blue-700 border border-blue-200',
  'En revisión': 'bg-orange-100 text-orange-700 border border-orange-200',
  Resuelta: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

const BandejaPage: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RequestFilters>({ type: '', urgency: undefined });
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters: RequestFilters = {};
      if (filters.type) activeFilters.type = filters.type;
      if (filters.urgency) activeFilters.urgency = filters.urgency;
      const data = await requestService.getAll(activeFilters);
      setRequests(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const handleRowClick = (req: Request) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleStatusChange = async (id: number, newStatus: RequestStatus) => {
    setUpdatingId(id);
    try {
      const updated = await requestService.updateStatus(id, { status: newStatus });
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      // If the modal is open for this request, refresh it so history reloads
      setSelectedRequest((prev) => (prev && prev.id === updated.id ? updated : prev));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <RequestDetailModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <div className="w-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Bandeja de Solicitudes</h2>
          <span className="text-sm text-gray-500">
            {loading ? 'Cargando...' : `${requests.length} solicitud${requests.length !== 1 ? 'es' : ''}`}
          </span>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Filtrar por Tipo</label>
            <select
              name="type"
              value={filters.type ?? ''}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              {REQUEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Filtrar por Urgencia</label>
            <select
              name="urgency"
              value={filters.urgency ?? ''}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las urgencias</option>
              {URGENCY_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ type: '', urgency: undefined })}
              className="px-4 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
            <button
              onClick={fetchRequests}
              className="ml-4 underline text-red-700 hover:text-red-900"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Hint */}
        {!loading && requests.length > 0 && (
          <p className="mb-3 text-xs text-gray-400 italic">
            Haz clic en cualquier fila para ver el detalle de la solicitud.
          </p>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">#</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Urgencia</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Descripción</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Solicitante</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Área</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    <span className="inline-block animate-pulse">Cargando solicitudes...</span>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    No se encontraron solicitudes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(req)}
                    title="Clic para ver detalle"
                  >
                    <td className="px-4 py-3 text-gray-500 font-mono">{req.id}</td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{req.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${URGENCY_BADGE[req.urgency]}`}
                      >
                        {req.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs">
                      <span title={req.description} className="line-clamp-2 block">
                        {req.description}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{req.requester}</td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{req.area}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[req.status]}`}
                        >
                          {req.status}
                        </span>
                        <select
                          value={req.status}
                          disabled={updatingId === req.id}
                          onChange={(e) => {
                            handleStatusChange(req.id, e.target.value as RequestStatus);
                          }}
                          className="text-xs border border-gray-200 rounded-md px-1.5 py-1 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                          aria-label={`Cambiar estado de solicitud ${req.id}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(req.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default BandejaPage;

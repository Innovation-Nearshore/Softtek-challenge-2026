import { useState, useEffect, useCallback } from 'react';
import { fetchRequests } from '../services/requestsService';
import RequestForm from '../components/RequestForm';
import RequestsTable from '../components/RequestsTable';

const URGENCIAS = ['Alta', 'Media', 'Baja'];

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('todas');
  const [urgencia, setUrgencia] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = filter === 'pendientes' ? 'pendientes' : undefined;
      const data = await fetchRequests(status, urgencia || undefined);
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, urgencia]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestor de Solicitudes
          </h1>
          <p className="text-gray-500 mt-1">
            Crea y visualiza solicitudes en tiempo real.
          </p>
        </header>

        <RequestForm onSuccess={loadRequests} />

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-semibold text-gray-700">
              Solicitudes registradas
            </h2>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Estado filter */}
              <div className="flex gap-1">
                <button
                  onClick={() => setFilter('todas')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === 'todas'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilter('pendientes')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === 'pendientes'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  En Revisión
                </button>
              </div>

              {/* Urgencia filter */}
              <select
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Todas las urgencias</option>
                {URGENCIAS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <p className="text-gray-400 text-sm">Cargando solicitudes...</p>
          )}
          {error && (
            <p className="text-red-500 text-sm">Error: {error}</p>
          )}
          {!loading && !error && (
            <RequestsTable requests={requests} onStatusUpdated={loadRequests} />
          )}
        </section>
      </div>
    </div>
  );
}

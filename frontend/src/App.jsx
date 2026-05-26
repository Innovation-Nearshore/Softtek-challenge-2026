import React, { useState, useEffect, useCallback } from 'react';
import { fetchRequests } from './services/api';
import Dashboard from './components/Dashboard';
import RequestForm from './components/RequestForm';
import RequestsTable from './components/RequestsTable';
import RequestDetailModal from './components/RequestDetailModal';

export default function App() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleCreated = useCallback(() => {
    loadRequests();
    setShowForm(false);
  }, [loadRequests]);

  const handleStatusChange = useCallback(() => {
    loadRequests();
  }, [loadRequests]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-blue-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎫</span>
            <div>
              <h1 className="text-xl font-bold leading-tight">Gestor de Solicitudes</h1>
              <p className="text-blue-200 text-xs">Sistema de Gestión — AI Challenge 2026</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="px-4 py-2 bg-white text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow"
          >
            {showForm ? '✖ Cancelar' : '➕ Nueva Solicitud'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Formulario (colapsable) */}
        {showForm && (
          <RequestForm onCreated={handleCreated} />
        )}

        {/* Dashboard Métricas */}
        <Dashboard requests={requests} />

        {/* Bandeja */}
        <RequestsTable
          requests={requests}
          loading={loading}
          error={error}
          onStatusChange={handleStatusChange}
          onRowClick={(r) => setSelectedId(r.id)}
        />
      </main>

      {/* Modal de Detalle */}
      {selectedId && (
        <RequestDetailModal
          requestId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

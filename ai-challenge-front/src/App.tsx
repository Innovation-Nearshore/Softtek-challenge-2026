import { useState, useMemo, useCallback } from 'react';
import { useIncidents } from './hooks/useIncidents';
import { IncidentFilters } from './components/IncidentFilters';
import type { FilterState } from './components/IncidentFilters';
import { IncidentTable } from './components/IncidentTable';
import { IncidentForm } from './components/IncidentForm';
import type { CreateIncidentPayload, Incident } from './types/incident';
import './App.css';

const INITIAL_FILTERS: FilterState = { status: '', severity: '' };

function App() {
  const { incidents, loading, error, addIncident, changeStatus } = useIncidents();

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Lista filtrada ────────────────────────────────────────────────────────
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchStatus   = filters.status   === '' || inc.status   === filters.status;
      const matchSeverity = filters.severity === '' || inc.severity === filters.severity;
      return matchStatus && matchSeverity;
    });
  }, [incidents, filters]);

  // ── KPI: contadores por estado (módulo Dashboard — 10 pts obligatorio) ────
  const statusCounts = useMemo(() => ({
    abierto:    incidents.filter((i) => i.status === 'Abierto').length,
    enAtencion: incidents.filter((i) => i.status === 'En atención').length,
    cerrado:    incidents.filter((i) => i.status === 'Cerrado').length,
  }), [incidents]);

  // ── Incidentes críticos abiertos (bonus +10 pts) ──────────────────────────
  const criticalOpen = useMemo(
    () => incidents.filter((i) => i.severity === 'Crítica' && i.status === 'Abierto'),
    [incidents]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCreateIncident = useCallback(
    async (payload: CreateIncidentPayload): Promise<void> => {
      setIsSubmitting(true);
      try {
        await addIncident(payload);
        setShowForm(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [addIncident]
  );

  const handleStatusChange = useCallback(
    async (id: number, newStatus: Incident['status']): Promise<void> => {
      await changeStatus(id, newStatus);
    },
    [changeStatus]
  );

  return (
    <div className="app-container">
      {/* ── Header ── */}
      <header className="app-header">
        <h1>Sistema de Gestión de Incidentes</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowForm((prev) => !prev)}
          aria-expanded={showForm}
          aria-controls="incident-form-panel"
        >
          {showForm ? '✕ Cancelar' : '+ Nuevo Incidente'}
        </button>
      </header>

      <main className="app-main">
        {/* ── Formulario (colapsable) ── */}
        {showForm && (
          <section
            id="incident-form-panel"
            className="form-panel"
            aria-label="Formulario de creación de incidente"
          >
            <IncidentForm onSubmit={handleCreateIncident} isSubmitting={isSubmitting} />
          </section>
        )}

        {/* ── KPI Dashboard — contadores por estado ── */}
        {!loading && (
          <div className="kpi-bar" role="region" aria-label="Resumen de incidentes por estado">
            <div className="kpi-card kpi-open">
              <span className="kpi-label">Abierto</span>
              <span className="kpi-value" aria-label={`${statusCounts.abierto} incidentes abiertos`}>
                {statusCounts.abierto}
              </span>
            </div>
            <div className="kpi-card kpi-attention">
              <span className="kpi-label">En atención</span>
              <span className="kpi-value" aria-label={`${statusCounts.enAtencion} incidentes en atención`}>
                {statusCounts.enAtencion}
              </span>
            </div>
            <div className="kpi-card kpi-closed">
              <span className="kpi-label">Cerrado</span>
              <span className="kpi-value" aria-label={`${statusCounts.cerrado} incidentes cerrados`}>
                {statusCounts.cerrado}
              </span>
            </div>
            <div className="kpi-card kpi-total">
              <span className="kpi-label">Total</span>
              <span className="kpi-value" aria-label={`${incidents.length} incidentes en total`}>
                {incidents.length}
              </span>
            </div>
          </div>
        )}

        {/* ── Alerta de incidentes críticos abiertos (bonus +10 pts) ── */}
        {!loading && criticalOpen.length > 0 && (
          <div className="critical-alert" role="alert" aria-live="polite">
            <div className="critical-alert-header">
              🚨 {criticalOpen.length} incidente{criticalOpen.length !== 1 ? 's' : ''} CRÍTICO{criticalOpen.length !== 1 ? 'S' : ''} sin atender
            </div>
            <ul className="critical-alert-list">
              {criticalOpen.map((inc) => (
                <li key={inc.id}>
                  <strong>#{inc.id}</strong> — {inc.title}
                  <span className="critical-alert-area">{inc.area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Sección filtros + tabla ── */}
        <section className="table-section" aria-label="Listado de incidentes">
          {loading && (
            <p className="loading-state" role="status" aria-live="polite">
              Cargando incidentes…
            </p>
          )}

          {error && !loading && (
            <p className="error-state" role="alert">
              ❌ Error al cargar incidentes: {error}
            </p>
          )}

          {!loading && (
            <IncidentFilters
              filters={filters}
              onFilterChange={setFilters}
              resultCount={filteredIncidents.length}
            />
          )}

          {!loading && (
            <IncidentTable
              incidents={filteredIncidents}
              onStatusChange={handleStatusChange}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

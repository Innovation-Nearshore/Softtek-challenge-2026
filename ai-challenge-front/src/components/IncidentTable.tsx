import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Incident, IncidentLogEntry } from '../types/incident';
import { STATUS_OPTIONS } from './IncidentFilters';
import { fetchIncidentLog } from '../services/incidentsApi';

interface IncidentTableProps {
    incidents: Incident[];
    onStatusChange: (id: number, newStatus: Incident['status']) => Promise<void>;
}

// ── Helpers visuales ──────────────────────────────────────────────────────────

const SEVERITY_CLASS: Record<Incident['severity'], string> = {
    Crítica: 'badge badge-critical',
    Alta:    'badge badge-high',
    Media:   'badge badge-medium',
    Baja:    'badge badge-low',
};

const STATUS_CLASS: Record<Incident['status'], string> = {
    Abierto:      'badge badge-open',
    'En atención': 'badge badge-in-progress',
    Cerrado:      'badge badge-closed',
};

const formatDate = (isoString: string): string => {
    try {
        return new Date(isoString).toLocaleString('es-CO', {
            year: 'numeric', month: 'short', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return isoString;
    }
};

// ── Fila individual ───────────────────────────────────────────────────────────

interface IncidentRowProps {
    incident: Incident;
    onStatusChange: (id: number, newStatus: Incident['status']) => Promise<void>;
}

const IncidentRow = ({ incident, onStatusChange }: IncidentRowProps) => {
    const [rowLoading, setRowLoading]   = useState(false);
    const [rowError, setRowError]       = useState<string | null>(null);
    const [expanded, setExpanded]       = useState(false);
    const [logEntries, setLogEntries]   = useState<IncidentLogEntry[]>([]);
    const [logLoading, setLogLoading]   = useState(false);
    const [logError, setLogError]       = useState<string | null>(null);
    const [logFetched, setLogFetched]   = useState(false);

    const handleStatusSelect = async (e: ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as Incident['status'];
        if (newStatus === incident.status) return;

        setRowLoading(true);
        setRowError(null);
        try {
            await onStatusChange(incident.id, newStatus);
            // Invalidar log cacheado al cambiar estado
            setLogFetched(false);
            setLogEntries([]);
        } catch (err) {
            setRowError(err instanceof Error ? err.message : 'Error al actualizar');
        } finally {
            setRowLoading(false);
        }
    };

    const handleToggleLog = async () => {
        const nextExpanded = !expanded;
        setExpanded(nextExpanded);

        if (nextExpanded && !logFetched) {
            setLogLoading(true);
            setLogError(null);
            try {
                const entries = await fetchIncidentLog(incident.id);
                setLogEntries(entries);
                setLogFetched(true);
            } catch (err) {
                setLogError(err instanceof Error ? err.message : 'Error al cargar historial');
            } finally {
                setLogLoading(false);
            }
        }
    };

    return (
        <>
            <tr className={expanded ? 'row-expanded' : undefined}>
                {/* ID */}
                <td className="col-id">#{incident.id}</td>

                {/* Título + descripción resumida */}
                <td className="col-title">
                    <span className="incident-title">{incident.title}</span>
                    {incident.description && (
                        <span className="incident-description" title={incident.description}>
                            {incident.description.length > 80
                                ? `${incident.description.slice(0, 80)}…`
                                : incident.description}
                        </span>
                    )}
                </td>

                {/* Categoría */}
                <td className="col-category">{incident.category}</td>

                {/* Área */}
                <td className="col-area">{incident.area}</td>

                {/* Reportador */}
                <td className="col-reporter">{incident.reporter}</td>

                {/* Severidad */}
                <td className="col-severity">
                    <span className={SEVERITY_CLASS[incident.severity]}>{incident.severity}</span>
                </td>

                {/* Estado + selector inline */}
                <td className="col-status">
                    <div className="col-status-inner">
                        <span className={STATUS_CLASS[incident.status]} aria-hidden="true">
                            {incident.status}
                        </span>
                        <label htmlFor={`status-select-${incident.id}`} className="sr-only">
                            Cambiar estado del incidente #{incident.id}
                        </label>
                        <select
                            id={`status-select-${incident.id}`}
                            value={incident.status}
                            onChange={handleStatusSelect}
                            disabled={rowLoading}
                            className={`status-select${rowLoading ? ' loading' : ''}`}
                            aria-label={`Estado del incidente ${incident.title}`}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        {rowLoading && (
                            <span className="row-loading" aria-live="polite" aria-atomic="true">
                                Guardando…
                            </span>
                        )}
                        {rowError && (
                            <span className="row-error" role="alert">{rowError}</span>
                        )}
                    </div>
                </td>

                {/* Fecha de creación */}
                <td className="col-date">
                    <time dateTime={incident.created_at}>{formatDate(incident.created_at)}</time>
                </td>

                {/* Botón historial */}
                <td className="col-log">
                    <button
                        type="button"
                        className="btn-expand"
                        onClick={handleToggleLog}
                        aria-expanded={expanded}
                        aria-label={`${expanded ? 'Ocultar' : 'Ver'} historial del incidente #${incident.id}`}
                        title={expanded ? 'Ocultar historial' : 'Ver historial de cambios'}
                    >
                        {logLoading ? '…' : expanded ? '▲' : '▼'}
                    </button>
                </td>
            </tr>

            {/* ── Fila expandida con historial ── */}
            {expanded && (
                <tr className="log-row">
                    <td colSpan={9} className="log-cell">
                        {logLoading && (
                            <p className="log-loading">Cargando historial…</p>
                        )}
                        {logError && (
                            <p className="log-error">❌ {logError}</p>
                        )}
                        {!logLoading && !logError && logEntries.length === 0 && (
                            <p className="log-empty">Sin historial registrado.</p>
                        )}
                        {!logLoading && logEntries.length > 0 && (
                            <table className="log-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Estado anterior</th>
                                        <th>Nuevo estado</th>
                                        <th>Nota</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logEntries.map((entry) => (
                                        <tr key={entry.id}>
                                            <td>
                                                <time dateTime={entry.changed_at}>
                                                    {formatDate(entry.changed_at)}
                                                </time>
                                            </td>
                                            <td>{entry.old_status ?? '—'}</td>
                                            <td>{entry.new_status}</td>
                                            <td>{entry.note ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
};

// ── Componente principal ──────────────────────────────────────────────────────

export const IncidentTable = ({ incidents, onStatusChange }: IncidentTableProps) => {
    if (incidents.length === 0) {
        return (
            <p className="empty-state" role="status">
                No se encontraron incidentes con los filtros seleccionados.
            </p>
        );
    }

    return (
        <div className="table-wrapper" role="region" aria-label="Listado de incidentes">
            <table className="incidents-table" aria-label="Tabla de incidentes">
                <thead>
                    <tr>
                        <th scope="col" className="col-id">ID</th>
                        <th scope="col" className="col-title">Título / Descripción</th>
                        <th scope="col" className="col-category">Categoría</th>
                        <th scope="col" className="col-area">Área</th>
                        <th scope="col" className="col-reporter">Reportador</th>
                        <th scope="col" className="col-severity">Severidad</th>
                        <th scope="col" className="col-status">Estado</th>
                        <th scope="col" className="col-date">Creado</th>
                        <th scope="col" className="col-log">Historial</th>
                    </tr>
                </thead>
                <tbody>
                    {incidents.map((incident) => (
                        <IncidentRow
                            key={incident.id}
                            incident={incident}
                            onStatusChange={onStatusChange}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

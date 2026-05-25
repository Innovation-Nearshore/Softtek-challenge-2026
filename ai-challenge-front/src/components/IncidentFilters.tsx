/**
 * COMPONENTE — IncidentFilters
 * Controles de filtrado por estado (status) y severidad (severity).
 * Los valores exactos provienen del CHECK CONSTRAINT del schema SQL.
 * El componente es stateless: delega el estado al padre mediante callbacks.
 */

import type { ChangeEvent } from 'react';
import type { Incident } from '../types/incident';

// ── Valores válidos extraídos del CHECK CONSTRAINT del schema SQL ─────────────
export const STATUS_OPTIONS: Incident['status'][] = ['Abierto', 'En atención', 'Cerrado'];
export const SEVERITY_OPTIONS: Incident['severity'][] = ['Crítica', 'Alta', 'Media', 'Baja'];

export interface FilterState {
    status: Incident['status'] | '';
    severity: Incident['severity'] | '';
}

interface IncidentFiltersProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    /** Número de resultados visibles después de aplicar los filtros */
    resultCount: number;
}

export const IncidentFilters = ({
    filters,
    onFilterChange,
    resultCount,
}: IncidentFiltersProps) => {
    const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({
            ...filters,
            status: e.target.value as Incident['status'] | '',
        });
    };

    const handleSeverityChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({
            ...filters,
            severity: e.target.value as Incident['severity'] | '',
        });
    };

    const handleClear = () => {
        onFilterChange({ status: '', severity: '' });
    };

    const hasActiveFilters = filters.status !== '' || filters.severity !== '';

    return (
        <div className="filters-bar" role="search" aria-label="Filtros de incidentes">
            {/* ── Filtro por Estado ── */}
            <div className="filter-group">
                <label htmlFor="filter-status">Estado</label>
                <select
                    id="filter-status"
                    value={filters.status}
                    onChange={handleStatusChange}
                    aria-label="Filtrar por estado"
                >
                    <option value="">Todos los estados</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>

            {/* ── Filtro por Severidad ── */}
            <div className="filter-group">
                <label htmlFor="filter-severity">Severidad</label>
                <select
                    id="filter-severity"
                    value={filters.severity}
                    onChange={handleSeverityChange}
                    aria-label="Filtrar por severidad"
                >
                    <option value="">Todas las severidades</option>
                    {SEVERITY_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>

            {/* ── Botón limpiar filtros ── */}
            {hasActiveFilters && (
                <button
                    type="button"
                    className="btn-secondary btn-clear"
                    onClick={handleClear}
                    aria-label="Limpiar todos los filtros"
                >
                    ✕ Limpiar filtros
                </button>
            )}

            {/* ── Contador de resultados ── */}
            <span className="filter-count" aria-live="polite" aria-atomic="true">
                {resultCount} resultado{resultCount !== 1 ? 's' : ''}
            </span>
        </div>
    );
};

/**
 * CUSTOM HOOK — useIncidents
 * Centraliza el estado de la lista de incidentes, la carga inicial
 * y las mutaciones (crear / cambiar estado).
 * Expone callbacks tipados que los componentes usan directamente.
 */

import { useState, useEffect } from 'react';
import type { Incident, CreateIncidentPayload } from '../types/incident';
import {
    fetchIncidents,
    createIncident,
    updateIncidentStatus,
} from '../services/incidentsApi';

interface UseIncidentsReturn {
    incidents: Incident[];
    loading: boolean;
    error: string | null;
    /** Agrega un nuevo incidente enviando POST al backend */
    addIncident: (payload: CreateIncidentPayload) => Promise<void>;
    /** Cambia el estado de un incidente enviando PUT al backend */
    changeStatus: (id: number, newStatus: Incident['status']) => Promise<void>;
    /** Recarga la lista completa desde la BD */
    refreshIncidents: () => Promise<void>;
}

export const useIncidents = (): UseIncidentsReturn => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Fetch inicial al montar el componente ────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchIncidents();
                if (!cancelled) setIncidents(data);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Error desconocido');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        // Cleanup: evita actualizar estado en componente desmontado
        return () => {
            cancelled = true;
        };
    }, []);

    // ── Recargar lista completa ──────────────────────────────────────────────
    const refreshIncidents = async () => {
        try {
            setError(null);
            const data = await fetchIncidents();
            setIncidents(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            throw err;
        }
    };

    // ── Crear incidente (POST) ───────────────────────────────────────────────
    const addIncident = async (payload: CreateIncidentPayload): Promise<void> => {
        const newIncident = await createIncident(payload);
        // Actualización optimista: prepend sin recargar
        setIncidents((prev) => [newIncident, ...prev]);
    };

    // ── Cambiar estado inline (PUT) ──────────────────────────────────────────
    const changeStatus = async (id: number, newStatus: Incident['status']): Promise<void> => {
        const updated = await updateIncidentStatus(id, newStatus);
        // Reemplaza el incidente en la lista localmente
        setIncidents((prev) =>
            prev.map((inc) => (inc.id === updated.id ? updated : inc))
        );
    };

    return {
        incidents,
        loading,
        error,
        addIncident,
        changeStatus,
        refreshIncidents,
    };
};

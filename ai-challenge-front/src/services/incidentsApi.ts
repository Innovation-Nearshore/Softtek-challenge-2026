import type { Incident, CreateIncidentPayload, ApiResponse, Category, IncidentLogEntry } from '../types/incident';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

// ── GET /api/incidents ────────────────────────────────────────────────────────

export const fetchIncidents = async (): Promise<Incident[]> => {
    const response = await fetch(`${API_BASE_URL}/incidents`);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json: ApiResponse<Incident[]> = await response.json();

    if (!json.success) {
        throw new Error(json.error ?? 'Error desconocido al obtener incidentes');
    }

    return json.data ?? [];
};

// ── POST /api/incidents ───────────────────────────────────────────────────────

export const createIncident = async (payload: CreateIncidentPayload): Promise<Incident> => {
    const response = await fetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const json: ApiResponse<Incident> = await response.json();

    if (!response.ok) {
        const errorMsg = json.details?.join(', ') ?? json.error ?? 'Error al crear incidente';
        throw new Error(errorMsg);
    }

    if (!json.success || !json.data) {
        throw new Error(json.error ?? 'Respuesta inesperada del servidor');
    }

    return json.data;
};

// ── PUT /api/incidents/:id/status ─────────────────────────────────────────────

export const updateIncidentStatus = async (
    id: number,
    newStatus: Incident['status']
): Promise<Incident> => {
    const response = await fetch(`${API_BASE_URL}/incidents/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus }),
    });

    const json: ApiResponse<Incident> = await response.json();

    if (!response.ok) {
        throw new Error(json.error ?? `HTTP ${response.status}: ${response.statusText}`);
    }

    if (!json.success || !json.data) {
        throw new Error(json.error ?? 'Respuesta inesperada del servidor');
    }

    return json.data;
};

// ── GET /api/incidents/categories ────────────────────────────────────────────

export const fetchCategories = async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/incidents/categories`);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json: ApiResponse<Category[]> = await response.json();

    if (!json.success) {
        throw new Error(json.error ?? 'Error al obtener categorías');
    }

    return json.data ?? [];
};

// ── GET /api/incidents/:id/log ────────────────────────────────────────────────

export const fetchIncidentLog = async (id: number): Promise<IncidentLogEntry[]> => {
    const response = await fetch(`${API_BASE_URL}/incidents/${id}/log`);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json: ApiResponse<IncidentLogEntry[]> = await response.json();

    if (!json.success) {
        throw new Error(json.error ?? 'Error al obtener historial');
    }

    return json.data ?? [];
};

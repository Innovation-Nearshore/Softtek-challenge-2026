export interface Incident {
    id: number;
    title: string;
    category: string;
    severity: 'Crítica' | 'Alta' | 'Media' | 'Baja';
    description?: string;
    reporter: string;
    area: string;
    status: 'Abierto' | 'En atención' | 'Cerrado';
    created_at: string;
    updated_at: string;
}

export interface CreateIncidentPayload {
    title: string;
    category: string;
    severity: 'Crítica' | 'Alta' | 'Media' | 'Baja';
    description?: string;
    reporter: string;
    area: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    details?: string[];
    message?: string;
}

export interface Category {
    id: number;
    nombre: string;
}

export interface IncidentLogEntry {
    id: number;
    incident_id: number;
    old_status: string | null;
    new_status: string;
    note: string | null;
    changed_at: string;
}

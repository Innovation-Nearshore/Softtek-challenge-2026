import type { Area, TipoSolicitud, Solicitud, CreateSolicitudPayload, Filters } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || `Error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// --- Áreas ---

export async function getAreas(): Promise<Area[]> {
  return fetchJSON<Area[]>(`${BASE_URL}/areas`);
}

// --- Tipos de solicitud ---

export async function getTiposSolicitud(): Promise<TipoSolicitud[]> {
  return fetchJSON<TipoSolicitud[]>(`${BASE_URL}/tipos-solicitud`);
}

// --- Solicitudes ---

export async function getSolicitudes(filters?: Partial<Filters>): Promise<Solicitud[]> {
  const params = new URLSearchParams();
  if (filters?.tipo) params.set("tipo", filters.tipo);
  if (filters?.urgencia) params.set("urgencia", filters.urgencia);

  const qs = params.toString();
  return fetchJSON<Solicitud[]>(`${BASE_URL}/solicitudes${qs ? `?${qs}` : ""}`);
}

export async function getSolicitudById(id: number): Promise<Solicitud> {
  return fetchJSON<Solicitud>(`${BASE_URL}/solicitudes/${id}`);
}

export async function createSolicitud(payload: CreateSolicitudPayload): Promise<Solicitud> {
  return fetchJSON<Solicitud>(`${BASE_URL}/solicitudes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEstadoSolicitud(id: number, estado: string): Promise<Solicitud> {
  return fetchJSON<Solicitud>(`${BASE_URL}/solicitudes/${id}/estado`, {
    method: "PUT",
    body: JSON.stringify({ estado }),
  });
}

// --- Solicitante View ---

export async function getSolicitudesBySolicitante(solicitante: string): Promise<Solicitud[]> {
  const params = new URLSearchParams({ solicitante });
  return fetchJSON<Solicitud[]>(`${BASE_URL}/solicitudes?${params.toString()}`);
}

export interface Area {
  id: number;
  nombre: string;
}

export interface TipoSolicitud {
  id: number;
  nombre: string;
}

export interface Solicitud {
  id: number;
  numero_ticket: string;
  tipo_solicitud_id: number;
  tipo_solicitud: string;
  titulo: string;
  descripcion: string;
  urgencia: "Alta" | "Media" | "Baja";
  estado: string;
  solicitante: string;
  email_solicitante: string;
  area_solicitante_id: number;
  area_solicitante: string;
  area_asignada_id: number | null;
  asignado_a: string | null;
  fecha_creacion: string;
  fecha_vencimiento: string | null;
  fecha_resolucion: string | null;
  solucion: string | null;
  calificacion: number | null;
}

export interface CreateSolicitudPayload {
  tipo_solicitud_id: number;
  titulo: string;
  descripcion: string;
  urgencia: "Alta" | "Media" | "Baja";
  solicitante: string;
  email_solicitante: string;
  area_solicitante_id: number;
}

export interface Filters {
  tipo: string;
  urgencia: string;
}

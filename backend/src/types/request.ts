export type Urgency = 'Alta' | 'Media' | 'Baja';
export type RequestStatus = 'Recibida' | 'En revisión' | 'Resuelta';

export interface Request {
  id: number;
  type: string;
  urgency: Urgency;
  description: string;
  requester: string;
  area: string;
  status: RequestStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRequestDTO {
  type: string;
  urgency: Urgency;
  description: string;
  requester: string;
  area: string;
}

export interface UpdateRequestStatusDTO {
  status: RequestStatus;
  comment?: string;
  changed_by?: string;
}

export interface RequestFilters {
  type?: string;
  urgency?: Urgency;
}

export interface StatusHistoryEntry {
  id: number;
  request_id: number;
  previous_status: RequestStatus | null;
  new_status: RequestStatus;
  comment: string | null;
  changed_at: Date;
  changed_by: string;
}

import type { Request, CreateRequestDTO, UpdateRequestStatusDTO, RequestFilters, StatusHistoryEntry } from '../types/request';

const BASE = '/api/requests';

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `HTTP error ${res.status}`);
  }
  return data.data as T;
}

export const requestService = {
  async getAll(filters?: RequestFilters): Promise<Request[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.urgency) params.set('urgency', filters.urgency);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE}${query}`);
    return handleResponse<Request[]>(res);
  },

  async getById(id: number): Promise<Request> {
    const res = await fetch(`${BASE}/${id}`);
    return handleResponse<Request>(res);
  },

  async create(dto: CreateRequestDTO): Promise<Request> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    return handleResponse<Request>(res);
  },

  async updateStatus(id: number, dto: UpdateRequestStatusDTO): Promise<Request> {
    const res = await fetch(`${BASE}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    return handleResponse<Request>(res);
  },

  async getHistory(id: number): Promise<StatusHistoryEntry[]> {
    const res = await fetch(`${BASE}/${id}/history`);
    return handleResponse<StatusHistoryEntry[]>(res);
  },
};

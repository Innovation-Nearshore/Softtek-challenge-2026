import { requestRepository } from '../models/RequestRepository';
import type {
  Request,
  CreateRequestDTO,
  RequestFilters,
  RequestStatus,
  Urgency,
  StatusHistoryEntry,
} from '../types/request';

const VALID_URGENCIES: Urgency[] = ['Alta', 'Media', 'Baja'];
const VALID_STATUSES: RequestStatus[] = ['Recibida', 'En revisión', 'Resuelta'];

export class RequestService {
  async getAll(filters?: RequestFilters): Promise<Request[]> {
    return requestRepository.findAll(filters);
  }

  async getById(id: number): Promise<Request> {
    const request = await requestRepository.findById(id);
    if (!request) {
      throw new Error(`Request with id ${id} not found`);
    }
    return request;
  }

  async create(data: CreateRequestDTO): Promise<Request> {
    // Validate required fields
    const requiredFields: (keyof CreateRequestDTO)[] = [
      'type',
      'urgency',
      'description',
      'requester',
      'area',
    ];

    for (const field of requiredFields) {
      const value = data[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        throw new Error(`Field '${field}' is required and cannot be empty`);
      }
    }

    // Validate urgency enum
    if (!VALID_URGENCIES.includes(data.urgency)) {
      throw new Error(
        `Invalid urgency value '${data.urgency}'. Must be one of: ${VALID_URGENCIES.join(', ')}`
      );
    }

    // Sanitise string fields
    const sanitised: CreateRequestDTO = {
      type: data.type.trim(),
      urgency: data.urgency,
      description: data.description.trim(),
      requester: data.requester.trim(),
      area: data.area.trim(),
    };

    return requestRepository.create(sanitised);
  }

  async updateStatus(
    id: number,
    status: RequestStatus,
    comment?: string,
    changedBy?: string
  ): Promise<Request> {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(
        `Invalid status value '${status}'. Must be one of: ${VALID_STATUSES.join(', ')}`
      );
    }

    const updated = await requestRepository.updateStatus(id, status, comment, changedBy);
    if (!updated) {
      throw new Error(`Request with id ${id} not found`);
    }
    return updated;
  }

  async getHistory(requestId: number): Promise<StatusHistoryEntry[]> {
    // Verify the request exists
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new Error(`Request with id ${requestId} not found`);
    }
    return requestRepository.findHistory(requestId);
  }
}

export const requestService = new RequestService();

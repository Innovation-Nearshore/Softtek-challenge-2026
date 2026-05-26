
import { RequestService } from '../../src/services/RequestService';
import { requestRepository } from '../../src/models/RequestRepository';
import type { Request, CreateRequestDTO, StatusHistoryEntry } from '../../src/types/request';

// Mock the entire repository module
jest.mock('../../src/models/RequestRepository', () => ({
  requestRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    findHistory: jest.fn(),
  },
}));

const mockRepo = requestRepository as jest.Mocked<typeof requestRepository>;

const makeRequest = (overrides: Partial<Request> = {}): Request => ({
  id: 1,
  type: 'Soporte',
  urgency: 'Alta',
  description: 'Test description',
  requester: 'John Doe',
  area: 'TI',
  status: 'Recibida',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  ...overrides,
});

describe('RequestService', () => {
  let service: RequestService;

  beforeEach(() => {
    service = new RequestService();
    jest.clearAllMocks();
  });

  // ─── getAll ────────────────────────────────────────────────────────────────
  describe('getAll', () => {
    it('returns all requests when no filters provided', async () => {
      const requests = [makeRequest(), makeRequest({ id: 2 })];
      mockRepo.findAll.mockResolvedValue(requests);

      const result = await service.getAll();

      expect(mockRepo.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(requests);
    });

    it('forwards filters to repository', async () => {
      mockRepo.findAll.mockResolvedValue([]);
      await service.getAll({ type: 'Soporte', urgency: 'Alta' });
      expect(mockRepo.findAll).toHaveBeenCalledWith({ type: 'Soporte', urgency: 'Alta' });
    });
  });

  // ─── getById ───────────────────────────────────────────────────────────────
  describe('getById', () => {
    it('returns the request when it exists', async () => {
      const req = makeRequest();
      mockRepo.findById.mockResolvedValue(req);

      const result = await service.getById(1);
      expect(result).toEqual(req);
    });

    it('throws an error when request is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getById(99)).rejects.toThrow('Request with id 99 not found');
    });
  });

  // ─── create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    const validDTO: CreateRequestDTO = {
      type: 'Aprobación',
      urgency: 'Media',
      description: 'Need approval',
      requester: 'Jane Doe',
      area: 'Finanzas',
    };

    it('creates and returns the request for valid input', async () => {
      const created = makeRequest({ type: 'Aprobación', urgency: 'Media' });
      mockRepo.create.mockResolvedValue(created);

      const result = await service.create(validDTO);
      expect(result).toEqual(created);
      expect(mockRepo.create).toHaveBeenCalledWith({
        type: 'Aprobación',
        urgency: 'Media',
        description: 'Need approval',

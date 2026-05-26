import { RequestService } from '../../src/services/RequestService';
import { requestRepository } from '../../src/models/RequestRepository';
import type { Request, CreateRequestDTO, StatusHistoryEntry } from '../../src/types/request';

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

  // getAll
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

  // getById
  describe('getById', () => {
    it('returns the request when it exists', async () => {
      const req = makeRequest();
      mockRepo.findById.mockResolvedValue(req);
      const result = await service.getById(1);
      expect(result).toEqual(req);
    });

    it('throws when request is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.getById(99)).rejects.toThrow('Request with id 99 not found');
    });
  });

  // create
  describe('create', () => {
    const validDTO: CreateRequestDTO = {
      type: 'Aprobacion',
      urgency: 'Media',
      description: 'Need approval',
      requester: 'Jane Doe',
      area: 'Finanzas',
    };

    it('creates and returns the request for valid input', async () => {
      const created = makeRequest({ type: 'Aprobacion', urgency: 'Media' });
      mockRepo.create.mockResolvedValue(created);
      const result = await service.create(validDTO);
      expect(result).toEqual(created);
      expect(mockRepo.create).toHaveBeenCalledWith({
        type: 'Aprobacion',
        urgency: 'Media',
        description: 'Need approval',
        requester: 'Jane Doe',
        area: 'Finanzas',
      });
    });

    it('trims whitespace from string fields', async () => {
      const dtoWithSpaces: CreateRequestDTO = {
        ...validDTO,
        type: '  Soporte  ',
        description: '  desc  ',
        requester: '  John  ',
        area: '  TI  ',
      };
      mockRepo.create.mockResolvedValue(makeRequest());
      await service.create(dtoWithSpaces);
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'Soporte', description: 'desc', requester: 'John', area: 'TI' })
      );
    });

    it('throws when type is empty', async () => {
      await expect(service.create({ ...validDTO, type: '' })).rejects.toThrow("Field 'type' is required");
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('throws when description is empty', async () => {
      await expect(service.create({ ...validDTO, description: '' })).rejects.toThrow("Field 'description' is required");
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('throws when requester is empty', async () => {
      await expect(service.create({ ...validDTO, requester: '' })).rejects.toThrow("Field 'requester' is required");
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('throws when area is empty', async () => {
      await expect(service.create({ ...validDTO, area: '' })).rejects.toThrow("Field 'area' is required");
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('throws for invalid urgency value', async () => {
      const dto = { ...validDTO, urgency: 'Critica' as 'Alta' };
      await expect(service.create(dto)).rejects.toThrow("Invalid urgency value 'Critica'");
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  // updateStatus
  describe('updateStatus', () => {
    it('updates and returns the request for a valid status', async () => {
      const updated = makeRequest({ status: 'Resuelta' });
      mockRepo.updateStatus.mockResolvedValue(updated);
      const result = await service.updateStatus(1, 'Resuelta');
      expect(result).toEqual(updated);
      expect(mockRepo.updateStatus).toHaveBeenCalledWith(1, 'Resuelta', undefined, undefined);
    });

    it('passes optional comment and changedBy to repository', async () => {
      mockRepo.updateStatus.mockResolvedValue(makeRequest({ status: 'Resuelta' }));
      await service.updateStatus(1, 'Resuelta', 'Issue fixed', 'admin');
      expect(mockRepo.updateStatus).toHaveBeenCalledWith(1, 'Resuelta', 'Issue fixed', 'admin');
    });

    it('throws for invalid status value', async () => {
      await expect(service.updateStatus(1, 'Pendiente' as 'Recibida')).rejects.toThrow("Invalid status value 'Pendiente'");
      expect(mockRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('throws when request is not found during update', async () => {
      mockRepo.updateStatus.mockResolvedValue(null);
      await expect(service.updateStatus(99, 'Resuelta')).rejects.toThrow('Request with id 99 not found');
    });
  });

  // getHistory
  describe('getHistory', () => {
    const historyEntry: StatusHistoryEntry = {
      id: 1,
      request_id: 1,
      previous_status: 'Recibida',
      new_status: 'En revision' as 'En revisión',
      comment: 'Started review',
      changed_at: new Date('2024-01-02'),
      changed_by: 'admin',
    };

    it('returns history for an existing request', async () => {
      mockRepo.findById.mockResolvedValue(makeRequest());
      mockRepo.findHistory.mockResolvedValue([historyEntry]);
      const result = await service.getHistory(1);
      expect(result).toEqual([historyEntry]);
    });

    it('returns empty array when no history exists', async () => {
      mockRepo.findById.mockResolvedValue(makeRequest());
      mockRepo.findHistory.mockResolvedValue([]);
      const result = await service.getHistory(1);
      expect(result).toEqual([]);
    });

    it('throws when request does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.getHistory(99)).rejects.toThrow('Request with id 99 not found');
      expect(mockRepo.findHistory).not.toHaveBeenCalled();
    });
  });
});
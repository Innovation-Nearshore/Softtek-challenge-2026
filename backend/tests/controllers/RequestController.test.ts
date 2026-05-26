import { RequestController } from '../../src/controllers/RequestController';
import { requestService } from '../../src/services/RequestService';
import type { Request as ExpressRequest, Response, NextFunction } from 'express';

jest.mock('../../src/services/RequestService', () => ({
  requestService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    getHistory: jest.fn(),
  },
}));

const mockService = requestService as jest.Mocked<typeof requestService>;

function makeRes(): jest.Mocked<Partial<Response>> {
  const res: jest.Mocked<Partial<Response>> = {
    status: jest.fn().mockReturnThis() as unknown as jest.MockedFunction<Response['status']>,
    json: jest.fn().mockReturnThis() as unknown as jest.MockedFunction<Response['json']>,
  };
  return res;
}

const next: NextFunction = jest.fn();

const baseRequest = {
  id: 1,
  type: 'Soporte',
  urgency: 'Alta' as const,
  description: 'Test',
  requester: 'Jane',
  area: 'TI',
  status: 'Recibida' as const,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('RequestController', () => {
  let controller: RequestController;

  beforeEach(() => {
    controller = new RequestController();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns 200 with requests array', async () => {
      mockService.getAll.mockResolvedValue([baseRequest]);
      const req = { query: {} } as ExpressRequest;
      const res = makeRes();
      await controller.getAll(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [baseRequest], total: 1 });
    });

    it('passes type and urgency filters from query', async () => {
      mockService.getAll.mockResolvedValue([]);
      const req = { query: { type: 'Soporte', urgency: 'Alta' } } as unknown as ExpressRequest;
      const res = makeRes();
      await controller.getAll(req, res as unknown as Response, next);
      expect(mockService.getAll).toHaveBeenCalledWith({ type: 'Soporte', urgency: 'Alta' });
    });

    it('calls next on unexpected error', async () => {
      const error = new Error('DB error');
      mockService.getAll.mockRejectedValue(error);
      const req = { query: {} } as ExpressRequest;
      const res = makeRes();
      await controller.getAll(req, res as unknown as Response, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('returns 200 when request exists', async () => {
      mockService.getById.mockResolvedValue(baseRequest);
      const req = { params: { id: '1' } } as unknown as ExpressRequest;
      const res = makeRes();
      await controller.getById(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: baseRequest });
    });

    it('returns 400 for non-numeric id', async () => {
      const req = { params: { id: 'abc' } } as unknown as ExpressRequest;
      const res = makeRes();
      await controller.getById(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when service throws not found', async () => {
      mockService.getById.mockRejectedValue(new Error('Request with id 99 not found'));
      const req = { params: { id: '99' } } as unknown as ExpressRequest;
      const res = makeRes();
      await controller.getById(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('create', () => {
    it('returns 201 on successful creation', async () => {
      mockService.create.mockResolvedValue(baseRequest);
      const req = { body: { type: 'Soporte', urgency: 'Alta', description: 'Test', requester: 'Jane', area: 'TI' } } as ExpressRequest;
      const res = makeRes();
      await controller.create(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: baseRequest });
    });

    it('returns 400 when a required field is missing', async () => {
      mockService.create.mockRejectedValue(new Error("Field 'type' is required and cannot be empty"));
      const req = { body: {} } as ExpressRequest;
      const res = makeRes();
      await controller.create(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 for invalid urgency', async () => {
      mockService.create.mockRejectedValue(new Error("Invalid urgency value 'X'"));
      const req = { body: {} } as ExpressRequest;
      const res = makeRes();
      await controller.create(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateStatus', () => {
    it('returns 200 on successful status update', async () => {
      mockService.updateStatus.mockResolvedValue({ ...baseRequest, status: 'Resuelta' });
      const req = { params: { id: '1' }, body: { status: 'Resuelta' } } as unknown as ExpressRequest;
      const res = makeRes();
      await controller.updateStatus(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 400 when status is missing', async () => {
      const req = { params: { id: '1' }, body: {} } as unknown as ExpressRequest;
      const res = makeRes();
      await controller.updateStatus(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when request is not found', async () => {
      mockService.updateStatus.mockRejectedValue(new Error('Request with id 99 not found'));
      const req = { params: { id: '99' }, body: { status: 'Resuelta' } } as unknown as ExpressRequest;
      const res = makeRes();
      await controller.updateStatus(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 400 for invalid status value', async () => {
      mockService.updateStatus.mockRejectedValue(new Error("Invalid status value 'X'"));
      const req = { params: { id: '1' }, body: { status: 'X' } } as unknown as ExpressRequest;
      const res = makeRes();
      await controller.updateStatus(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getHistory', () => {
    it('returns 200 with history array', async () => {
      mockService.getHistory.mockResolvedValue([]);
      const req = { params: { id: '1' } } as unknown as ExpressRequest;
      const res = makeRes();
      await controller.getHistory(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [], total: 0 });
    });

    it('returns 400 for non-numeric id', async () => {
      const req = { params: { id: 'xyz' } } as unknown as ExpressRequest;
      const res = makeRes();
      await controller.getHistory(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when request not found', async () => {
      mockService.getHistory.mockRejectedValue(new Error('Request with id 5 not found'));
      const req = { params: { id: '5' } } as unknown as ExpressRequest;
      const res = makeRes();
      await controller.getHistory(req, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
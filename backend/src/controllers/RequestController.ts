import type { Request as ExpressRequest, Response, NextFunction } from 'express';
import { requestService } from '../services/RequestService';
import type { CreateRequestDTO, RequestFilters, RequestStatus, Urgency } from '../types/request';

export class RequestController {
  async getAll(req: ExpressRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: RequestFilters = {};

      if (req.query['type'] && typeof req.query['type'] === 'string') {
        filters.type = req.query['type'];
      }

      if (req.query['urgency'] && typeof req.query['urgency'] === 'string') {
        filters.urgency = req.query['urgency'] as Urgency;
      }

      const requests = await requestService.getAll(filters);
      res.status(200).json({ success: true, data: requests, total: requests.length });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: ExpressRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id'] ?? '', 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id parameter' });
        return;
      }
      const request = await requestService.getById(id);
      res.status(200).json({ success: true, data: request });
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('not found')) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  async create(req: ExpressRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as CreateRequestDTO;
      const created = await requestService.create(body);
      res.status(201).json({ success: true, data: created });
    } catch (err: unknown) {
      if (err instanceof Error && err.message.startsWith('Field ')) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      if (err instanceof Error && err.message.startsWith('Invalid urgency')) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  async updateStatus(req: ExpressRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id'] ?? '', 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id parameter' });
        return;
      }

      const { status, comment, changed_by } = req.body as {
        status: RequestStatus;
        comment?: string;
        changed_by?: string;
      };
      if (!status) {
        res.status(400).json({ success: false, message: "Field 'status' is required" });
        return;
      }

      const updated = await requestService.updateStatus(id, status, comment, changed_by);
      res.status(200).json({ success: true, data: updated });
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('not found')) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err instanceof Error && err.message.startsWith('Invalid status')) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  async getHistory(req: ExpressRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id'] ?? '', 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id parameter' });
        return;
      }
      const history = await requestService.getHistory(id);
      res.status(200).json({ success: true, data: history, total: history.length });
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('not found')) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }
}

export const requestController = new RequestController();

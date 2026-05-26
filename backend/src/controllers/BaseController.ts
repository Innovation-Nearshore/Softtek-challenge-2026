import type { Request, Response, NextFunction } from 'express';
import type { BaseService } from '../services/BaseService';
import type { DatabaseEntity } from '../types';
import { sendSuccess, sendError, sendPaginatedSuccess } from '../utils/response';

export abstract class BaseController<T extends DatabaseEntity, S extends BaseService<T, any>> {
  protected service: S;

  constructor(service: S) {
    this.service = service;
  }

  protected async getPagination(req: Request): Promise<{ limit: number; offset: number }> {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const offset = (page - 1) * limit;
    return { limit, offset };
  }

  protected async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit, offset } = await this.getPagination(req);
      const items = await this.service.getAll(limit, offset);
      const total = await this.service.getCount();
      const page = Math.floor(offset / limit) + 1;

      sendPaginatedSuccess(res, items, total, page, limit, 200);
    } catch (error) {
      next(error);
    }
  }

  protected async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.service.getById(id);

      if (!item) {
        sendError(res, 'Resource not found', 'RESOURCE_NOT_FOUND', 404);
        return;
      }

      sendSuccess(res, item, 200);
    } catch (error) {
      next(error);
    }
  }

  abstract create(req: Request, res: Response, next: NextFunction): Promise<void>;
  abstract update(req: Request, res: Response, next: NextFunction): Promise<void>;
  abstract delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}

import type { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';

export const getHealth = (_req: Request, res: Response): void => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  sendSuccess(res, healthData, 200);
};

import type { Response } from 'express';
import type { ApiResponse, ErrorCode } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  code: ErrorCode,
  statusCode: number = 500,
  details?: Record<string, any>
): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

export const sendPaginatedSuccess = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  statusCode: number = 200
): void => {
  const totalPages = Math.ceil(total / limit);
  const response: ApiResponse = {
    success: true,
    data: {
      items: data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    },
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

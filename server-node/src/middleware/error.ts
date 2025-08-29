import { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, 'Not Found'));
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const correlationId = (req as any).correlationId;
  res.status(status).json({
    error: true,
    status,
    message: err?.message || 'Internal Server Error',
    correlationId,
    details: process.env.NODE_ENV === 'development' ? (err?.details || err?.stack) : undefined,
  });
}


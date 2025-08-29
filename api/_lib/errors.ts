export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function sendError(res: any, err: any, correlationId?: string) {
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({
    error: true,
    status,
    message: err?.message || 'Internal Server Error',
    correlationId,
    details: process.env.NODE_ENV === 'development' ? err?.details || err?.stack : undefined,
  });
}


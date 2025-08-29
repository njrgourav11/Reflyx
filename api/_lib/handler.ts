import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from './cors';
import { sendError } from './errors';
import { logInfo } from './logger';

export type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

export function withCommon(handler: Handler): Handler {
  return async (req, res) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || Math.random().toString(36).slice(2);
    (req as any).correlationId = correlationId;

    if (handleCors(req, res)) return;

    try {
      logInfo('incoming', { method: req.method, url: req.url, correlationId });
      await handler(req, res);
    } catch (err: any) {
      sendError(res, err, correlationId);
    }
  };
}


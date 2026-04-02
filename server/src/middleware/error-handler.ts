import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: 'Validation failed',
      details: err.flatten().fieldErrors,
    });
  }

  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  return res.status(500).json({ error: 'Internal server error' });
}

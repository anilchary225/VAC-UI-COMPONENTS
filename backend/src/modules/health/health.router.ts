import { Router, Request, Response } from 'express';
import { getDatabaseStatus } from '../../config/database';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  const db = getDatabaseStatus();

  res.status(200).json({
    success: true,
    status: db.status === 'connected' ? 'healthy' : 'degraded',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: db.status,
      error: db.error,
    },
  });
});

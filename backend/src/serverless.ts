import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';

const app = createApp();
let seeded = false;

export const serverlessHandler = async (req: Request, res: Response) => {
  // Normalize URL if Vercel serverless rewrite routed to /api or /api/index
  const matchedPath = (req.headers?.['x-matched-path'] || req.headers?.['x-forwarded-uri']) as string | undefined;
  if (matchedPath && (req.url === '/api' || req.url === '/api/index' || req.url?.startsWith('/api/index?') || req.url?.startsWith('/api?'))) {
    const queryIndex = req.url.indexOf('?');
    const query = queryIndex !== -1 ? req.url.slice(queryIndex) : '';
    req.url = matchedPath.includes('?') ? matchedPath : `${matchedPath}${query}`;
    req.originalUrl = req.url;
  }

  // 1. If not yet connected, initiate connection with a serverless timeout race
  if (mongoose.connection.readyState === 0) {
    const connectPromise = connectDatabase();
    const timeoutMs = env.NODE_ENV === 'test' ? 300 : 2500;

    await Promise.race([
      connectPromise,
      new Promise((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  }

  // 2. Seed initial official components once per warm container if database is connected
  if (mongoose.connection.readyState === 1 && !seeded) {
    try {
      const { ensureInitialComponentsSeeded } = await import('./modules/components/components.seed.service');
      await ensureInitialComponentsSeeded();
      seeded = true;
    } catch {
      // Non-blocking fallback
    }
  }

  // 3. Forward request to Express app
  return app(req, res);
};

export default serverlessHandler;
export { app };

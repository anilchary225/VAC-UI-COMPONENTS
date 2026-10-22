import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { healthRouter } from './modules/health/health.router';
import { authRouter } from './modules/auth/auth.router';
import { componentsRouter } from './modules/components/components.router';
import { categoriesRouter } from './modules/categories/categories.router';
import { favoritesRouter } from './modules/favorites/favorites.router';
import { collectionsRouter } from './modules/collections/collections.router';
import { adminRouter } from './modules/admin/admin.router';
import { registryRouter } from './modules/registry/registry.router';
import { errorHandler, AppError } from './middleware/errorHandler';
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimit';

export const createApp = (): Application => {
  const app = express();

  // Trust proxy for Vercel and reverse proxy load balancers
  app.set('trust proxy', 1);

  // Basic security headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // CORS configuration
  const allowedOrigins =
    env.NODE_ENV === 'production'
      ? [env.FRONTEND_URL]
      : [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, CLI, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(new AppError(`Origin '${origin}' not permitted by CORS policy.`, 403, 'CORS_ERROR'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate Limiting
  app.use('/api', apiRateLimiter);
  app.use('/api/auth', authRateLimiter);

  // Base API routes
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/components', componentsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/favorites', favoritesRouter);
  app.use('/api/collections', collectionsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/registry', registryRouter);

  // Fallback for unhandled routes
  app.all('*', (req: Request, _res: Response, next) => {
    next(new AppError(`Cannot ${req.method} ${req.originalUrl} on this server`, 404, 'ROUTE_NOT_FOUND'));
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};

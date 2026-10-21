import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { healthRouter } from './modules/health/health.router';
import { authRouter } from './modules/auth/auth.router';
import { componentsRouter } from './modules/components/components.router';
import { categoriesRouter } from './modules/categories/categories.router';
import { errorHandler, AppError } from './middleware/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
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

  // Base API routes
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/components', componentsRouter);
  app.use('/api/categories', categoriesRouter);

  // Fallback for unhandled routes
  app.all('*', (req: Request, _res: Response, next) => {
    next(new AppError(`Cannot ${req.method} ${req.originalUrl} on this server`, 404, 'ROUTE_NOT_FOUND'));
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};

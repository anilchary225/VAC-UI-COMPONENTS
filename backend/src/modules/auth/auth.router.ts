import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RegisterRequestSchema, LoginRequestSchema, UpdateProfileRequestSchema } from '@vac/shared';
import { validateBody } from '../../middleware/validate';
import { authenticateUser } from '../../middleware/auth';
import { AuthService } from './auth.service';

export const authRouter = Router();

// Register
authRouter.post(
  '/register',
  validateBody(RegisterRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Login
authRouter.post(
  '/login',
  validateBody(LoginRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Current user profile
authRouter.get(
  '/me',
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.getCurrentUser(req.user!.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update profile and preferences
authRouter.patch(
  '/profile',
  authenticateUser,
  validateBody(UpdateProfileRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.updateProfile(req.user!.id, req.body);
      res.status(200).json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Admin one-time bootstrap
const BootstrapSchema = z.object({
  secret: z.string(),
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});

authRouter.post(
  '/bootstrap-admin',
  validateBody(BootstrapSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { secret, email, name, password } = req.body;
      const admin = await AuthService.bootstrapAdmin(secret, email, name, password);
      res.status(201).json({
        success: true,
        message: 'Admin account created successfully.',
        data: admin,
      });
    } catch (err) {
      next(err);
    }
  }
);

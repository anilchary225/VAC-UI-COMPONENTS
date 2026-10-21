import { Router, Request, Response, NextFunction } from 'express';
import { FavoriteModel } from '../../models/Favorite';
import { ComponentModel } from '../../models/Component';
import { INITIAL_OFFICIAL_COMPONENTS } from '../components/components.seed';
import { authenticateUser } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { getDatabaseStatus } from '../../config/database';

export const favoritesRouter = Router();

// In-memory fallback for offline/test environments
const inMemoryFavorites = new Map<string, Set<string>>();

const isValidComponentSlug = async (slug: string): Promise<boolean> => {
  const normalized = slug.toLowerCase();
  const db = getDatabaseStatus();
  if (db.status === 'connected') {
    try {
      const exists = await ComponentModel.exists({ slug: normalized, status: 'published' });
      if (exists) return true;
    } catch {
      // Fall through to static
    }
  }
  return INITIAL_OFFICIAL_COMPONENTS.some((c) => c.slug.toLowerCase() === normalized);
};

// GET /api/favorites - List all favorites for current authenticated user
favoritesRouter.get('/', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const db = getDatabaseStatus();

    if (db.status === 'connected') {
      try {
        const records = await FavoriteModel.find({ userId }).sort({ createdAt: -1 }).lean();
        const slugs = records.map((r) => r.componentSlug);
        return res.json({
          success: true,
          data: slugs,
        });
      } catch (err) {
        console.warn('DB favorites query failed, falling back to memory store:', err);
      }
    }

    const userFavs = inMemoryFavorites.get(userId) || new Set<string>();
    return res.json({
      success: true,
      data: Array.from(userFavs),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/favorites/:slug - Add component to favorites
favoritesRouter.post('/:slug', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const slug = (req.params.slug as string).toLowerCase().trim();

    const exists = await isValidComponentSlug(slug);
    if (!exists) {
      throw new AppError(`Component '${slug}' does not exist in catalog`, 404, 'COMPONENT_NOT_FOUND');
    }

    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        const existing = await FavoriteModel.findOne({ userId, componentSlug: slug });
        if (!existing) {
          await FavoriteModel.create({ userId, componentSlug: slug });
        }
        return res.status(201).json({
          success: true,
          data: { componentSlug: slug },
          message: 'Component added to favorites',
        });
      } catch (err: any) {
        if (err.code === 11000) {
          // Duplicate key gracefully handled
          return res.status(200).json({
            success: true,
            data: { componentSlug: slug },
            message: 'Component is already favorited',
          });
        }
        throw err;
      }
    }

    // In-memory fallback
    if (!inMemoryFavorites.has(userId)) {
      inMemoryFavorites.set(userId, new Set<string>());
    }
    inMemoryFavorites.get(userId)!.add(slug);

    return res.status(201).json({
      success: true,
      data: { componentSlug: slug },
      message: 'Component added to favorites',
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/favorites/:slug - Remove component from favorites
favoritesRouter.delete('/:slug', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const slug = (req.params.slug as string).toLowerCase().trim();

    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        await FavoriteModel.deleteOne({ userId, componentSlug: slug });
        return res.json({
          success: true,
          message: 'Component removed from favorites',
        });
      } catch (err) {
        console.warn('DB favorite delete failed, fallback to memory:', err);
      }
    }

    const userFavs = inMemoryFavorites.get(userId);
    if (userFavs) {
      userFavs.delete(slug);
    }

    return res.json({
      success: true,
      message: 'Component removed from favorites',
    });
  } catch (err) {
    next(err);
  }
});

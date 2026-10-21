import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { CollectionModel, ICollection } from '../../models/Collection';
import { ComponentModel } from '../../models/Component';
import { INITIAL_OFFICIAL_COMPONENTS } from '../components/components.seed';
import { authenticateUser } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { getDatabaseStatus } from '../../config/database';
import { CreateCollectionRequestSchema } from '@vac/shared';
import { validateBody } from '../../middleware/validate';

export const collectionsRouter = Router();

// In-memory fallback collection structure for offline/test environments
interface MemoryCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  items: Array<{ componentSlug: string; addedAt: string; order: number }>;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}
const inMemoryCollections = new Map<string, MemoryCollection[]>();

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

const formatCollection = (doc: any) => ({
  id: doc._id ? doc._id.toString() : doc.id,
  userId: doc.userId?.toString() || doc.userId,
  name: doc.name,
  description: doc.description || '',
  items: (doc.items || []).map((it: any) => ({
    componentSlug: it.componentSlug,
    addedAt: it.addedAt instanceof Date ? it.addedAt.toISOString() : it.addedAt,
    order: it.order ?? 0,
  })),
  isPrivate: doc.isPrivate ?? true,
  createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
  updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
});

// GET /api/collections - List user collections
collectionsRouter.get('/', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const db = getDatabaseStatus();

    if (db.status === 'connected') {
      try {
        const collections = await CollectionModel.find({ userId }).sort({ updatedAt: -1 }).lean();
        return res.json({
          success: true,
          data: collections.map(formatCollection),
        });
      } catch (err) {
        console.warn('DB collections find failed, falling back to memory store:', err);
      }
    }

    const list = inMemoryCollections.get(userId) || [];
    return res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/collections - Create collection
collectionsRouter.post(
  '/',
  authenticateUser,
  validateBody(CreateCollectionRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { name, description } = req.body;
      const trimmedName = name.trim();

      const db = getDatabaseStatus();
      if (db.status === 'connected') {
        try {
          const existing = await CollectionModel.findOne({ userId, name: trimmedName });
          if (existing) {
            throw new AppError('A collection with this name already exists', 409, 'COLLECTION_NAME_EXISTS');
          }

          const col = await CollectionModel.create({
            userId,
            name: trimmedName,
            description: description?.trim() || '',
            items: [],
            isPrivate: true,
          });

          return res.status(201).json({
            success: true,
            data: formatCollection(col),
          });
        } catch (err: any) {
          if (err instanceof AppError) throw err;
          if (err.code === 11000) {
            throw new AppError('A collection with this name already exists', 409, 'COLLECTION_NAME_EXISTS');
          }
          throw err;
        }
      }

      // In-memory fallback
      const userCols = inMemoryCollections.get(userId) || [];
      if (userCols.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
        throw new AppError('A collection with this name already exists', 409, 'COLLECTION_NAME_EXISTS');
      }

      const now = new Date().toISOString();
      const newCol: MemoryCollection = {
        id: new mongoose.Types.ObjectId().toString(),
        userId,
        name: trimmedName,
        description: description?.trim() || '',
        items: [],
        isPrivate: true,
        createdAt: now,
        updatedAt: now,
      };

      userCols.push(newCol);
      inMemoryCollections.set(userId, userCols);

      return res.status(201).json({
        success: true,
        data: newCol,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/collections/:id - Get collection details
collectionsRouter.get('/:id', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new AppError('Collection not found', 404, 'NOT_FOUND');
        }
        const col = await CollectionModel.findOne({ _id: id, userId }).lean();
        if (!col) {
          throw new AppError('Collection not found', 404, 'NOT_FOUND');
        }
        return res.json({
          success: true,
          data: formatCollection(col),
        });
      } catch (err) {
        if (err instanceof AppError) throw err;
        console.warn('DB collection findOne error:', err);
      }
    }

    const userCols = inMemoryCollections.get(userId) || [];
    const found = userCols.find((c) => c.id === id);
    if (!found) {
      throw new AppError('Collection not found', 404, 'NOT_FOUND');
    }

    return res.json({
      success: true,
      data: found,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/collections/:id - Rename or update collection
collectionsRouter.patch('/:id', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { name, description } = req.body;

    if (!name && description === undefined) {
      throw new AppError('At least name or description must be provided', 400, 'BAD_REQUEST');
    }

    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new AppError('Collection not found', 404, 'NOT_FOUND');
        }

        const updateObj: any = {};
        if (name) updateObj.name = name.trim();
        if (description !== undefined) updateObj.description = description.trim();

        const updated = await CollectionModel.findOneAndUpdate(
          { _id: id, userId },
          { $set: updateObj },
          { new: true, runValidators: true }
        ).lean();

        if (!updated) {
          throw new AppError('Collection not found', 404, 'NOT_FOUND');
        }

        return res.json({
          success: true,
          data: formatCollection(updated),
        });
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        if (err.code === 11000) {
          throw new AppError('A collection with this name already exists', 409, 'COLLECTION_NAME_EXISTS');
        }
        throw err;
      }
    }

    const userCols = inMemoryCollections.get(userId) || [];
    const found = userCols.find((c) => c.id === id);
    if (!found) {
      throw new AppError('Collection not found', 404, 'NOT_FOUND');
    }

    if (name) found.name = name.trim();
    if (description !== undefined) found.description = description.trim();
    found.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      data: found,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/collections/:id - Delete collection
collectionsRouter.delete('/:id', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new AppError('Collection not found', 404, 'NOT_FOUND');
        }
        const result = await CollectionModel.deleteOne({ _id: id, userId });
        if (result.deletedCount === 0) {
          throw new AppError('Collection not found', 404, 'NOT_FOUND');
        }
        return res.json({
          success: true,
          message: 'Collection deleted successfully',
        });
      } catch (err) {
        if (err instanceof AppError) throw err;
        console.warn('DB collection delete error:', err);
      }
    }

    const userCols = inMemoryCollections.get(userId) || [];
    const idx = userCols.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new AppError('Collection not found', 404, 'NOT_FOUND');
    }

    userCols.splice(idx, 1);
    return res.json({
      success: true,
      message: 'Collection deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/collections/:id/items - Add component to collection
collectionsRouter.post('/:id/items', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { componentSlug } = req.body;

    if (!componentSlug || typeof componentSlug !== 'string') {
      throw new AppError('componentSlug is required', 400, 'BAD_REQUEST');
    }

    const slug = componentSlug.toLowerCase().trim();
    const exists = await isValidComponentSlug(slug);
    if (!exists) {
      throw new AppError(`Component '${slug}' does not exist in catalog`, 404, 'COMPONENT_NOT_FOUND');
    }

    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new AppError('Collection not found', 404, 'NOT_FOUND');
        }

        const col = await CollectionModel.findOne({ _id: id, userId });
        if (!col) {
          throw new AppError('Collection not found', 404, 'NOT_FOUND');
        }

        // Prevent duplicate items
        const alreadyInCollection = col.items.some((it) => it.componentSlug === slug);
        if (alreadyInCollection) {
          return res.status(200).json({
            success: true,
            data: formatCollection(col),
            message: 'Component is already in collection',
          });
        }

        const nextOrder = col.items.length;
        col.items.push({
          componentSlug: slug,
          addedAt: new Date(),
          order: nextOrder,
        });
        await col.save();

        return res.status(201).json({
          success: true,
          data: formatCollection(col),
          message: 'Component added to collection',
        });
      } catch (err) {
        if (err instanceof AppError) throw err;
        console.warn('DB add item to collection error:', err);
      }
    }

    const userCols = inMemoryCollections.get(userId) || [];
    const found = userCols.find((c) => c.id === id);
    if (!found) {
      throw new AppError('Collection not found', 404, 'NOT_FOUND');
    }

    if (!found.items.some((it) => it.componentSlug === slug)) {
      found.items.push({
        componentSlug: slug,
        addedAt: new Date().toISOString(),
        order: found.items.length,
      });
      found.updatedAt = new Date().toISOString();
    }

    return res.status(201).json({
      success: true,
      data: found,
      message: 'Component added to collection',
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/collections/:id/items/:slug - Remove component from collection
collectionsRouter.delete('/:id/items/:slug', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const paramSlug = req.params.slug as string;
    const slug = paramSlug.toLowerCase().trim();

    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new AppError('Collection not found', 404, 'NOT_FOUND');
        }

        const col = await CollectionModel.findOne({ _id: id, userId });
        if (!col) {
          throw new AppError('Collection not found', 404, 'NOT_FOUND');
        }

        col.items = col.items.filter((it) => it.componentSlug !== slug);
        await col.save();

        return res.json({
          success: true,
          data: formatCollection(col),
          message: 'Component removed from collection',
        });
      } catch (err) {
        if (err instanceof AppError) throw err;
        console.warn('DB remove item from collection error:', err);
      }
    }

    const userCols = inMemoryCollections.get(userId) || [];
    const found = userCols.find((c) => c.id === id);
    if (!found) {
      throw new AppError('Collection not found', 404, 'NOT_FOUND');
    }

    found.items = found.items.filter((it) => it.componentSlug !== slug);
    found.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      data: found,
      message: 'Component removed from collection',
    });
  } catch (err) {
    next(err);
  }
});

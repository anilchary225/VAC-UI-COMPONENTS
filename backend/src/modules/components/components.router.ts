import { Router, Request, Response, NextFunction } from 'express';
import { ComponentModel } from '../../models/Component';
import { ComponentVersionModel } from '../../models/ComponentVersion';
import { getDatabaseStatus } from '../../config/database';
import { INITIAL_OFFICIAL_COMPONENTS } from './components.seed';
import { AppError } from '../../middleware/errorHandler';

export const componentsRouter = Router();

// GET /api/components - List catalog components
componentsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, sort = 'downloads' } = req.query as {
      search?: string;
      category?: string;
      sort?: string;
    };

    const db = getDatabaseStatus();

    // If database is connected, attempt fetching from Mongo
    if (db.status === 'connected') {
      try {
        const query: any = { status: 'published' };
        if (category && category !== 'all') {
          query.category = category;
        }
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
          ];
        }

        const sortObj: any = {};
        if (sort === 'downloads') sortObj.downloadsCount = -1;
        else if (sort === 'favorites') sortObj.favoritesCount = -1;
        else if (sort === 'newest') sortObj.createdAt = -1;
        else sortObj.createdAt = -1;

        const dbComponents = await ComponentModel.find(query).sort(sortObj).lean();

        if (dbComponents && dbComponents.length > 0) {
          return res.json({
            success: true,
            data: dbComponents.map((c: any) => ({
              id: c._id.toString(),
              slug: c.slug,
              name: c.name,
              description: c.description,
              category: c.category,
              tags: c.tags,
              status: c.status,
              currentVersion: c.currentVersion,
              previewComponent: c.previewComponent,
              isOfficial: c.isOfficial,
              downloadsCount: c.downloadsCount,
              favoritesCount: c.favoritesCount,
              createdAt: c.createdAt?.toISOString?.() || c.createdAt,
              updatedAt: c.updatedAt?.toISOString?.() || c.updatedAt,
            })),
          });
        }
      } catch (dbErr) {
        console.warn('DB query failed, falling back to static official components:', dbErr);
      }
    }

    // Static fallback for seed / offline catalog
    let results = [...INITIAL_OFFICIAL_COMPONENTS];
    if (category && category !== 'all') {
      results = results.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sort === 'downloads') {
      results.sort((a, b) => b.downloadsCount - a.downloadsCount);
    } else if (sort === 'favorites') {
      results.sort((a, b) => b.favoritesCount - a.favoritesCount);
    }

    res.json({
      success: true,
      data: results.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        category: c.category,
        tags: c.tags,
        status: c.status,
        currentVersion: c.currentVersion,
        previewComponent: c.previewComponent,
        isOfficial: c.isOfficial,
        downloadsCount: c.downloadsCount,
        favoritesCount: c.favoritesCount,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/components/:slug - Get component detail
componentsRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const db = getDatabaseStatus();

    if (db.status === 'connected') {
      try {
        const comp = await ComponentModel.findOne({ slug }).lean();
        if (comp) {
          const versions = await ComponentVersionModel.find({ componentSlug: slug })
            .sort({ publishedAt: -1 })
            .lean();
          const latestRelease = versions[0];

          return res.json({
            success: true,
            data: {
              ...comp,
              id: (comp as any)._id.toString(),
              latestRelease,
              versions,
            },
          });
        }
      } catch (dbErr) {
        console.warn('DB detail query failed, falling back to static:', dbErr);
      }
    }

    const staticComp = INITIAL_OFFICIAL_COMPONENTS.find((c) => c.slug === slug);
    if (!staticComp) {
      throw new AppError(`Component '${slug}' not found`, 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data: staticComp,
    });
  } catch (err) {
    next(err);
  }
});

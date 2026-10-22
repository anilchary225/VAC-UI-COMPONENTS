import { Router, Request, Response, NextFunction } from 'express';
import { RegistryService } from './registry.service';
import { AppError } from '../../middleware/errorHandler';

export const registryRouter = Router();

// GET /api/registry/components/:slug - Summary of published component and available versions
registryRouter.get('/components/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = (req.params.slug as string || '').toLowerCase().trim();
    const versions = await RegistryService.listPublishedVersions(slug);

    if (versions.length === 0) {
      throw new AppError(`Component "${slug}" not found in the public registry.`, 404, 'COMPONENT_NOT_FOUND');
    }

    const latest = await RegistryService.getLatestReleaseManifest(slug);
    if (!latest) {
      throw new AppError(`Release for component "${slug}" could not be retrieved.`, 404, 'RELEASE_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        name: latest.name,
        slug: latest.slug,
        description: latest.description,
        category: latest.category,
        latestVersion: latest.version,
        versions,
        manifestUrl: `/api/registry/components/${slug}/${latest.version}/manifest`,
        integrity: latest.integrity,
        publishedAt: latest.publishedAt,
        deprecated: latest.deprecated,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/registry/components/:slug/versions - List all published versions for a component
registryRouter.get('/components/:slug/versions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = (req.params.slug as string || '').toLowerCase().trim();
    const versions = await RegistryService.listPublishedVersions(slug);

    if (versions.length === 0) {
      throw new AppError(`Component "${slug}" not found in the public registry.`, 404, 'COMPONENT_NOT_FOUND');
    }

    const details = await RegistryService.listPublishedVersionDetails(slug);

    res.json({
      success: true,
      data: {
        slug,
        versions,
        latest: versions[0],
        details,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/registry/components/:slug/compare - Compare two published versions with detailed file & metadata diffs
const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9a-zA-Z.-]+))?(?:\+([0-9a-zA-Z.-]+))?$/;

registryRouter.get('/components/:slug/compare', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = (req.params.slug as string || '').toLowerCase().trim();
    const fromVersion = (req.query.from as string || '').trim();
    const toVersion = (req.query.to as string || '').trim();

    if (!fromVersion || !toVersion) {
      throw new AppError(
        'Both "from" and "to" query parameters are required for version comparison.',
        400,
        'INVALID_QUERY'
      );
    }

    if (!SEMVER_REGEX.test(fromVersion) || !SEMVER_REGEX.test(toVersion)) {
      throw new AppError(
        'Both "from" and "to" versions must follow valid semver format (e.g. 1.0.0).',
        400,
        'INVALID_VERSION'
      );
    }

    const comparison = await RegistryService.compareReleases(slug, fromVersion, toVersion);

    res.json({
      success: true,
      data: comparison,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/registry/components/:slug/:version - Fetch full immutable release manifest
registryRouter.get('/components/:slug/:version', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = (req.params.slug as string || '').toLowerCase().trim();
    const version = (req.params.version as string || '').trim();

    const manifest = await RegistryService.getReleaseManifest(slug, version);

    if (!manifest) {
      throw new AppError(
        `Version "${version}" for component "${slug}" not found in the registry.`,
        404,
        'VERSION_NOT_FOUND'
      );
    }

    // Set immutable cache header for releases
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    res.json({
      success: true,
      data: manifest,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/registry/components/:slug/:version/manifest - Direct manifest JSON download
registryRouter.get('/components/:slug/:version/manifest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = (req.params.slug as string || '').toLowerCase().trim();
    const version = (req.params.version as string || '').trim();

    const manifest = await RegistryService.getReleaseManifest(slug, version);

    if (!manifest) {
      throw new AppError(
        `Version "${version}" for component "${slug}" not found in the registry.`,
        404,
        'VERSION_NOT_FOUND'
      );
    }

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(manifest, null, 2));
  } catch (err) {
    next(err);
  }
});

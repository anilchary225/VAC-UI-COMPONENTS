import { Router, Request, Response, NextFunction } from 'express';
import { authenticateUser, requireRole } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { validateComponentDraft } from './admin.validation';
import { AdminStore } from './admin.store';
import { CategoryModel } from '../../models/Category';

export const adminRouter = Router();

// Apply strict admin authentication and authorization to all admin endpoints
adminRouter.use(authenticateUser);
adminRouter.use(requireRole(['admin']));

// -------------------------------------------------------------
// 1. Admin Overview & Stats
// -------------------------------------------------------------
adminRouter.get('/overview', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AdminStore.getOverview();
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 2. Component Management & Studio CRUD
// -------------------------------------------------------------

// GET /api/admin/components - Query all components with filters
adminRouter.get('/components', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, status, sort, order, page, limit } = req.query as Record<string, string>;

    const data = await AdminStore.queryComponents({
      search,
      category,
      status,
      sort,
      order,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/components - Create a new component draft
adminRouter.post('/components', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, category, tags = [], documentation = '', license = 'MIT', author = 'VAC Team' } = req.body;

    if (!name || !slug) {
      throw new AppError('Name and slug are required to create a component record.', 400, 'VALIDATION_FAILED');
    }

    const cleanSlug = slug.trim().toLowerCase();
    const existing = await AdminStore.findBySlugOrId(cleanSlug);
    if (existing) {
      throw new AppError(`A component with slug "${cleanSlug}" already exists.`, 409, 'DUPLICATE_SLUG');
    }

    // Default starter file
    const pascalName = name
      .replace(/[^a-zA-Z0-9]+(.)/g, (_m: string, chr: string) => chr.toUpperCase())
      .replace(/^[a-z]/, (m: string) => m.toUpperCase());

    const initialStarterCode = `import React from 'react';

export interface ${pascalName}Props {
  title?: string;
  className?: string;
}

export const ${pascalName}: React.FC<${pascalName}Props> = ({
  title = "${name}",
  className = "",
}) => {
  return (
    <div className={\`p-6 rounded-2xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 shadow-lg \${className}\`}>
      <h3 className="text-lg font-semibold text-[#161722] dark:text-white">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">${description || 'Component draft ready for customization.'}</p>
    </div>
  );
};

export default ${pascalName};
`;

    const initialFiles = [
      {
        path: `src/components/${pascalName}.tsx`,
        name: `${pascalName}.tsx`,
        content: initialStarterCode,
        language: 'typescript' as const,
        isEntry: true,
      },
    ];

    const newComponent = await AdminStore.createComponent(
      {
        name: name.trim(),
        slug: cleanSlug,
        description: (description || '').trim(),
        category: category || 'Auth & Form Fields',
        tags: Array.isArray(tags) ? tags : [],
        status: 'draft',
        currentVersion: '0.1.0',
        documentation,
        license,
        author,
        draftFiles: initialFiles,
        draftDependencies: { react: '>=18.0.0', 'react-dom': '>=18.0.0' },
        draftPeerDependencies: {},
        draftProps: [
          {
            name: 'title',
            type: 'string',
            required: false,
            defaultValue: `"${name}"`,
            description: 'Primary heading text for the component',
          },
        ],
        draftChangelog: 'Initial draft version created in Component Studio.',
      },
      req.user!.id
    );

    await AdminStore.recordAudit({
      actorEmail: req.user!.email,
      actorName: req.user!.name,
      action: 'component.create',
      resourceType: 'component',
      resourceId: cleanSlug,
      details: { id: newComponent.id, name, slug: cleanSlug },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: newComponent,
      message: 'Draft component created successfully.',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/components/:id - Get component detail with draft & versions
adminRouter.get('/components/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id as string;
    const component = await AdminStore.findBySlugOrId(idParam);

    if (!component) {
      throw new AppError(`Component "${idParam}" not found.`, 404, 'NOT_FOUND');
    }

    const versions = await AdminStore.getVersions(component.slug);

    res.json({
      success: true,
      data: {
        ...component,
        versions,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/components/:id - Update draft metadata and source files
adminRouter.patch('/components/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id as string;
    const component = await AdminStore.findBySlugOrId(idParam);

    if (!component) {
      throw new AppError(`Component "${idParam}" not found.`, 404, 'NOT_FOUND');
    }

    const {
      name,
      description,
      category,
      tags,
      documentation,
      license,
      author,
      draftFiles,
      draftDependencies,
      draftPeerDependencies,
      draftProps,
      draftChangelog,
      status,
      currentVersion,
    } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (category !== undefined) updates.category = category.trim();
    if (tags !== undefined && Array.isArray(tags)) updates.tags = tags;
    if (documentation !== undefined) updates.documentation = documentation;
    if (license !== undefined) updates.license = license;
    if (author !== undefined) updates.author = author;
    if (draftFiles !== undefined && Array.isArray(draftFiles)) updates.draftFiles = draftFiles;
    if (draftDependencies !== undefined) updates.draftDependencies = draftDependencies;
    if (draftPeerDependencies !== undefined) updates.draftPeerDependencies = draftPeerDependencies;
    if (draftProps !== undefined && Array.isArray(draftProps)) updates.draftProps = draftProps;
    if (draftChangelog !== undefined) updates.draftChangelog = draftChangelog;
    if (status !== undefined) updates.status = status;
    if (currentVersion !== undefined) updates.currentVersion = currentVersion;

    const updated = await AdminStore.updateComponent(component.slug, updates);

    await AdminStore.recordAudit({
      actorEmail: req.user!.email,
      actorName: req.user!.name,
      action: 'component.update_draft',
      resourceType: 'component',
      resourceId: component.slug,
      details: { id: component.id, slug: component.slug },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      data: updated,
      message: 'Component draft saved successfully.',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/components/:id/validate - Run server-side validation pipeline
adminRouter.post('/components/:id/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id as string;
    const component = await AdminStore.findBySlugOrId(idParam);

    if (!component) {
      throw new AppError(`Component "${idParam}" not found.`, 404, 'NOT_FOUND');
    }

    const report = await validateComponentDraft({
      id: component.id,
      slug: component.slug,
      name: component.name,
      description: component.description,
      category: component.category,
      license: component.license,
      author: component.author,
      files: component.draftFiles,
      dependencies: component.draftDependencies,
      peerDependencies: component.draftPeerDependencies,
      props: component.draftProps,
      version: component.currentVersion,
    });

    const updated = await AdminStore.updateComponent(component.slug, {
      lastValidationResult: {
        valid: report.valid,
        errors: report.errors,
        checkedAt: report.checkedAt.toISOString(),
      },
    });

    await AdminStore.recordAudit({
      actorEmail: req.user!.email,
      actorName: req.user!.name,
      action: 'component.validate',
      resourceType: 'component',
      resourceId: component.slug,
      details: { valid: report.valid, errorCount: report.errors.length },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      data: {
        report,
        component: updated,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/components/:id/publish - Validate and publish an immutable release
adminRouter.post('/components/:id/publish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id as string;
    const component = await AdminStore.findBySlugOrId(idParam);

    if (!component) {
      throw new AppError(`Component "${idParam}" not found.`, 404, 'NOT_FOUND');
    }

    const { version, changelog } = req.body as { version?: string; changelog?: string };
    const targetVersion = (version || component.currentVersion || '1.0.0').trim();

    // 1. Run validation pipeline
    const report = await validateComponentDraft({
      id: component.id,
      slug: component.slug,
      name: component.name,
      description: component.description,
      category: component.category,
      license: component.license,
      author: component.author,
      files: component.draftFiles,
      dependencies: component.draftDependencies,
      peerDependencies: component.draftPeerDependencies,
      props: component.draftProps,
      version: targetVersion,
    });

    if (!report.valid) {
      throw new AppError(
        `Cannot publish component with validation errors: ${report.errors.join('; ')}`,
        400,
        'PUBLISH_VALIDATION_FAILED'
      );
    }

    // 2. Publish release and enforce immutability
    const result = await AdminStore.publishRelease(component.slug, targetVersion, changelog || '', req.user!.id);

    await AdminStore.recordAudit({
      actorEmail: req.user!.email,
      actorName: req.user!.name,
      action: 'component.publish',
      resourceType: 'component',
      resourceId: component.slug,
      details: { version: targetVersion, changelog: result.version.changelog },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Component "${component.name}" version ${targetVersion} published successfully.`,
      data: {
        component: result.component,
        version: result.version,
      },
    });
  } catch (err: any) {
    if (err.code === 'VERSION_IMMUTABLE' || err.statusCode === 409) {
      return next(new AppError(err.message, 409, 'VERSION_IMMUTABLE'));
    }
    next(err);
  }
});

// POST /api/admin/components/:id/deprecate - Deprecate a component
adminRouter.post('/components/:id/deprecate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id as string;
    const component = await AdminStore.findBySlugOrId(idParam);

    if (!component) {
      throw new AppError(`Component "${idParam}" not found.`, 404, 'NOT_FOUND');
    }

    const updated = await AdminStore.updateComponent(component.slug, { status: 'deprecated' });

    await AdminStore.recordAudit({
      actorEmail: req.user!.email,
      actorName: req.user!.name,
      action: 'component.deprecate',
      resourceType: 'component',
      resourceId: component.slug,
      details: { reason: req.body?.reason || 'Administrative deprecation' },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Component "${component.name}" deprecated.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/components/:id/versions - Version history
adminRouter.get('/components/:id/versions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id as string;
    const component = await AdminStore.findBySlugOrId(idParam);

    if (!component) {
      throw new AppError(`Component "${idParam}" not found.`, 404, 'NOT_FOUND');
    }

    const versions = await AdminStore.getVersions(component.slug);

    res.json({
      success: true,
      data: versions,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 3. Category Administration
// -------------------------------------------------------------
adminRouter.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await CategoryModel.find().lean();
    res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, icon } = req.body;
    if (!name || !slug) {
      throw new AppError('Category name and slug are required.', 400, 'VALIDATION_FAILED');
    }

    const cleanSlug = slug.trim().toLowerCase();
    const existing = await CategoryModel.findOne({ slug: cleanSlug });
    if (existing) {
      throw new AppError(`Category "${cleanSlug}" already exists.`, 409, 'DUPLICATE_CATEGORY');
    }

    const category = await CategoryModel.create({
      name: name.trim(),
      slug: cleanSlug,
      description: (description || '').trim(),
      icon: icon || 'Folder',
    });

    await AdminStore.recordAudit({
      actorEmail: req.user!.email,
      actorName: req.user!.name,
      action: 'category.create',
      resourceType: 'category',
      resourceId: cleanSlug,
      details: { name, slug: cleanSlug },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 4. Audit Logs & Analytics
// -------------------------------------------------------------
adminRouter.get('/audit-logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action, resourceType, page = '1', limit = '25' } = req.query as Record<string, string>;

    const data = await AdminStore.queryAuditLogs({
      action,
      resourceType,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/analytics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AdminStore.getAnalytics();
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

import mongoose from 'mongoose';
import { getDatabaseStatus } from '../../config/database';
import { ComponentModel } from '../../models/Component';
import { ComponentVersionModel } from '../../models/ComponentVersion';
import { AuditLogModel } from '../../models/AuditLog';
import { CategoryModel } from '../../models/Category';
import { INITIAL_OFFICIAL_COMPONENTS } from '../components/components.seed';
import { ComponentFile, ComponentProp } from '@vac/shared';
import { createReleaseManifest } from '@vac/registry';
import { fileRegistryStore, s3RegistryStore } from '../registry/registry.service';
import { UserModel } from '../../models/User';
import { env } from '../../config/env';

export interface AdminComponentData {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  status: 'draft' | 'validating' | 'in_review' | 'published' | 'deprecated';
  currentVersion: string;
  previewComponent?: string;
  isOfficial: boolean;
  downloadsCount: number;
  favoritesCount: number;
  documentation: string;
  license: string;
  author: string;
  draftFiles: ComponentFile[];
  draftDependencies: Record<string, string>;
  draftPeerDependencies: Record<string, string>;
  draftProps: ComponentProp[];
  draftChangelog: string;
  lastValidationResult?: {
    valid: boolean;
    errors: string[];
    checkedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminVersionData {
  componentSlug: string;
  version: string;
  changelog: string;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  files: ComponentFile[];
  props: ComponentProp[];
  publishedAt: string;
  publishedBy?: string;
  deprecated?: boolean;
  deprecationReason?: string;
}

export interface AuditLogData {
  id: string;
  actorEmail: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

// In-memory fallback stores
const memoryComponents = new Map<string, AdminComponentData>();
const memoryVersions: AdminVersionData[] = [];
const memoryAuditLogs: AuditLogData[] = [];

// Initialize memory components from seed if memory store is empty
function ensureMemoryInitialized() {
  if (memoryComponents.size === 0) {
    for (const c of INITIAL_OFFICIAL_COMPONENTS) {
      const compData: AdminComponentData = {
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        category: c.category,
        tags: c.tags,
        status: c.status as any,
        currentVersion: c.currentVersion,
        previewComponent: c.previewComponent,
        isOfficial: c.isOfficial,
        downloadsCount: c.downloadsCount,
        favoritesCount: c.favoritesCount,
        documentation: c.documentation,
        license: c.license,
        author: c.author,
        draftFiles: c.latestRelease?.files || [],
        draftDependencies: c.latestRelease?.dependencies || {},
        draftPeerDependencies: c.latestRelease?.peerDependencies || {},
        draftProps: c.latestRelease?.props || [],
        draftChangelog: c.latestRelease?.changelog || '',
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
      memoryComponents.set(c.slug, compData);

      if (c.latestRelease) {
        memoryVersions.push({
          componentSlug: c.slug,
          version: c.latestRelease.version,
          changelog: c.latestRelease.changelog,
          dependencies: c.latestRelease.dependencies,
          peerDependencies: c.latestRelease.peerDependencies,
          files: c.latestRelease.files,
          props: c.latestRelease.props,
          publishedAt: c.createdAt || new Date().toISOString(),
        });
      }
    }
  }
}

export const AdminStore = {
  getMemoryPublished(): AdminComponentData[] {
    ensureMemoryInitialized();
    return Array.from(memoryComponents.values()).filter((c) => c.status === 'published');
  },

  async getOverview() {
    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        const [totalComponents, publishedCount, draftCount, deprecatedCount, recentComponents, recentAuditLogs] =
          await Promise.all([
            ComponentModel.countDocuments(),
            ComponentModel.countDocuments({ status: 'published' }),
            ComponentModel.countDocuments({ status: { $in: ['draft', 'validating', 'in_review'] } }),
            ComponentModel.countDocuments({ status: 'deprecated' }),
            ComponentModel.find().sort({ updatedAt: -1 }).limit(5).lean(),
            AuditLogModel.find().sort({ createdAt: -1 }).limit(10).lean(),
          ]);

        const validationIssuesCount = await ComponentModel.countDocuments({
          'lastValidationResult.valid': false,
        });

        return {
          totalComponents,
          publishedCount,
          draftCount,
          deprecatedCount,
          validationIssuesCount,
          recentComponents: recentComponents.map((c) => ({
            id: (c as any)._id.toString(),
            slug: c.slug,
            name: c.name,
            category: c.category,
            status: c.status,
            currentVersion: c.currentVersion,
            updatedAt: c.updatedAt,
          })),
          recentAuditLogs: recentAuditLogs.map((log) => ({
            id: (log as any)._id.toString(),
            action: log.action,
            actorEmail: log.actorEmail,
            actorName: log.actorName,
            resourceType: log.resourceType,
            resourceId: log.resourceId,
            details: log.details,
            createdAt: log.createdAt,
          })),
        };
      } catch (err) {
        console.warn('DB overview failed, using memory fallback:', err);
      }
    }

    // In-memory fallback
    ensureMemoryInitialized();
    const all = Array.from(memoryComponents.values());
    const totalComponents = all.length;
    const publishedCount = all.filter((c) => c.status === 'published').length;
    const draftCount = all.filter((c) => ['draft', 'validating', 'in_review'].includes(c.status)).length;
    const deprecatedCount = all.filter((c) => c.status === 'deprecated').length;
    const validationIssuesCount = all.filter((c) => c.lastValidationResult?.valid === false).length;

    const recentComponents = [...all]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    const recentAuditLogs = [...memoryAuditLogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      totalComponents,
      publishedCount,
      draftCount,
      deprecatedCount,
      validationIssuesCount,
      recentComponents,
      recentAuditLogs,
    };
  },

  async queryComponents(params: {
    search?: string;
    category?: string;
    status?: string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, category, status, sort = 'updatedAt', order = 'desc', page = 1, limit = 20 } = params;
    const db = getDatabaseStatus();

    if (db.status === 'connected') {
      try {
        const filter: any = {};
        if (status && status !== 'all') filter.status = status;
        if (category && category !== 'all') filter.category = category;
        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
          ];
        }

        const skip = (page - 1) * limit;
        const sortObj: any = {};
        const sortField = sort === 'name' ? 'name' : sort === 'createdAt' ? 'createdAt' : 'updatedAt';
        sortObj[sortField] = order === 'asc' ? 1 : -1;

        const [total, items] = await Promise.all([
          ComponentModel.countDocuments(filter),
          ComponentModel.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
        ]);

        return {
          components: items.map((c) => ({
            id: (c as any)._id.toString(),
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
            validation: c.lastValidationResult,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          })),
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        };
      } catch (err) {
        console.warn('DB queryComponents failed, falling back to memory:', err);
      }
    }

    // In-memory fallback
    ensureMemoryInitialized();
    let all = Array.from(memoryComponents.values());

    if (status && status !== 'all') {
      all = all.filter((c) => c.status === status);
    }
    if (category && category !== 'all') {
      all = all.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      all = all.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    all.sort((a, b) => {
      const dir = order === 'asc' ? 1 : -1;
      if (sort === 'name') return a.name.localeCompare(b.name) * dir;
      const timeA = new Date(a.updatedAt).getTime();
      const timeB = new Date(b.updatedAt).getTime();
      return (timeA - timeB) * dir;
    });

    const total = all.length;
    const startIndex = (page - 1) * limit;
    const paginated = all.slice(startIndex, startIndex + limit);

    return {
      components: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async findBySlugOrId(idOrSlug: string): Promise<AdminComponentData | null> {
    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
        const comp = await ComponentModel.findOne(
          isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }
        ).lean();
        if (comp) {
          const deps = comp.draftDependencies instanceof Map
            ? Object.fromEntries(comp.draftDependencies)
            : (comp.draftDependencies as any) || {};
          const peerDeps = comp.draftPeerDependencies instanceof Map
            ? Object.fromEntries(comp.draftPeerDependencies)
            : (comp.draftPeerDependencies as any) || {};

          return {
            id: (comp as any)._id.toString(),
            slug: comp.slug,
            name: comp.name,
            description: comp.description,
            category: comp.category,
            tags: comp.tags,
            status: comp.status,
            currentVersion: comp.currentVersion,
            previewComponent: comp.previewComponent,
            isOfficial: comp.isOfficial,
            downloadsCount: comp.downloadsCount,
            favoritesCount: comp.favoritesCount,
            documentation: comp.documentation,
            license: comp.license,
            author: comp.author,
            draftFiles: comp.draftFiles || [],
            draftDependencies: deps,
            draftPeerDependencies: peerDeps,
            draftProps: comp.draftProps || [],
            draftChangelog: comp.draftChangelog || '',
            lastValidationResult: comp.lastValidationResult ? {
              valid: comp.lastValidationResult.valid,
              errors: comp.lastValidationResult.errors,
              checkedAt: comp.lastValidationResult.checkedAt?.toISOString?.() || new Date().toISOString(),
            } : undefined,
            createdAt: comp.createdAt instanceof Date ? comp.createdAt.toISOString() : String(comp.createdAt),
            updatedAt: comp.updatedAt instanceof Date ? comp.updatedAt.toISOString() : String(comp.updatedAt),
          };
        }
      } catch (err) {
        console.warn('DB findBySlugOrId failed, falling back to memory:', err);
      }
    }

    ensureMemoryInitialized();
    for (const c of memoryComponents.values()) {
      if (c.slug === idOrSlug || c.id === idOrSlug) {
        return c;
      }
    }
    return null;
  },

  async createComponent(data: Partial<AdminComponentData>, actorId?: string): Promise<AdminComponentData> {
    const db = getDatabaseStatus();
    const now = new Date().toISOString();

    if (db.status === 'connected') {
      try {
        const created = await ComponentModel.create({
          ...data,
          createdBy: actorId ? new mongoose.Types.ObjectId(actorId) : undefined,
        });
        return {
          id: created._id.toString(),
          slug: created.slug,
          name: created.name,
          description: created.description,
          category: created.category,
          tags: created.tags,
          status: created.status,
          currentVersion: created.currentVersion,
          previewComponent: created.previewComponent,
          isOfficial: created.isOfficial,
          downloadsCount: created.downloadsCount,
          favoritesCount: created.favoritesCount,
          documentation: created.documentation,
          license: created.license,
          author: created.author,
          draftFiles: created.draftFiles,
          draftDependencies: (data.draftDependencies as any) || {},
          draftPeerDependencies: (data.draftPeerDependencies as any) || {},
          draftProps: created.draftProps,
          draftChangelog: created.draftChangelog || '',
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn('DB createComponent failed, falling back to memory:', err);
      }
    }

    ensureMemoryInitialized();
    const newComp: AdminComponentData = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      slug: data.slug!,
      name: data.name!,
      description: data.description || '',
      category: data.category || 'Auth & Form Fields',
      tags: data.tags || [],
      status: (data.status as any) || 'draft',
      currentVersion: data.currentVersion || '0.1.0',
      previewComponent: data.previewComponent,
      isOfficial: true,
      downloadsCount: 0,
      favoritesCount: 0,
      documentation: data.documentation || '',
      license: data.license || 'MIT',
      author: data.author || 'VAC Team',
      draftFiles: data.draftFiles || [],
      draftDependencies: data.draftDependencies || {},
      draftPeerDependencies: data.draftPeerDependencies || {},
      draftProps: data.draftProps || [],
      draftChangelog: data.draftChangelog || '',
      createdAt: now,
      updatedAt: now,
    };

    memoryComponents.set(newComp.slug, newComp);
    return newComp;
  },

  async updateComponent(idOrSlug: string, updates: Partial<AdminComponentData>): Promise<AdminComponentData | null> {
    const db = getDatabaseStatus();

    if (db.status === 'connected') {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
        const comp = await ComponentModel.findOne(
          isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }
        );
        if (comp) {
          if (updates.name !== undefined) comp.name = updates.name;
          if (updates.description !== undefined) comp.description = updates.description;
          if (updates.category !== undefined) comp.category = updates.category;
          if (updates.tags !== undefined) comp.tags = updates.tags;
          if (updates.documentation !== undefined) comp.documentation = updates.documentation;
          if (updates.license !== undefined) comp.license = updates.license;
          if (updates.author !== undefined) comp.author = updates.author;
          if (updates.draftFiles !== undefined) comp.draftFiles = updates.draftFiles;
          if (updates.draftDependencies !== undefined) comp.draftDependencies = updates.draftDependencies as any;
          if (updates.draftPeerDependencies !== undefined) comp.draftPeerDependencies = updates.draftPeerDependencies as any;
          if (updates.draftProps !== undefined) comp.draftProps = updates.draftProps;
          if (updates.draftChangelog !== undefined) comp.draftChangelog = updates.draftChangelog;
          if (updates.status !== undefined) comp.status = updates.status as any;
          if (updates.currentVersion !== undefined) comp.currentVersion = updates.currentVersion;
          if (updates.lastValidationResult !== undefined) {
            comp.lastValidationResult = {
              valid: updates.lastValidationResult.valid,
              errors: updates.lastValidationResult.errors,
              checkedAt: new Date(updates.lastValidationResult.checkedAt),
            };
          }
          await comp.save();

          return {
            id: comp._id.toString(),
            slug: comp.slug,
            name: comp.name,
            description: comp.description,
            category: comp.category,
            tags: comp.tags,
            status: comp.status,
            currentVersion: comp.currentVersion,
            previewComponent: comp.previewComponent,
            isOfficial: comp.isOfficial,
            downloadsCount: comp.downloadsCount,
            favoritesCount: comp.favoritesCount,
            documentation: comp.documentation,
            license: comp.license,
            author: comp.author,
            draftFiles: comp.draftFiles,
            draftDependencies: (updates.draftDependencies as any) || {},
            draftPeerDependencies: (updates.draftPeerDependencies as any) || {},
            draftProps: comp.draftProps,
            draftChangelog: comp.draftChangelog || '',
            lastValidationResult: updates.lastValidationResult,
            createdAt: comp.createdAt.toISOString(),
            updatedAt: comp.updatedAt.toISOString(),
          };
        }
      } catch (err) {
        console.warn('DB updateComponent failed, falling back to memory:', err);
      }
    }

    ensureMemoryInitialized();
    let targetSlug = idOrSlug;
    let existing = memoryComponents.get(idOrSlug);
    if (!existing) {
      for (const [s, c] of memoryComponents.entries()) {
        if (c.id === idOrSlug) {
          existing = c;
          targetSlug = s;
          break;
        }
      }
    }

    if (!existing) return null;

    const updated: AdminComponentData = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    memoryComponents.set(targetSlug, updated);
    return updated;
  },

  async publishRelease(slug: string, version: string, changelog: string, actorId?: string): Promise<{ component: AdminComponentData; version: AdminVersionData }> {
    const comp = await this.findBySlugOrId(slug);
    if (!comp) {
      throw new Error(`Component ${slug} not found.`);
    }

    // Check immutability
    const existingVersions = await this.getVersions(comp.slug);
    if (existingVersions.some((v) => v.version === version)) {
      const err = new Error(`Version ${version} for "${comp.slug}" has already been published and is immutable.`);
      (err as any).statusCode = 409;
      (err as any).code = 'VERSION_IMMUTABLE';
      throw err;
    }

    const versionRecord: AdminVersionData = {
      componentSlug: comp.slug,
      version,
      changelog: changelog || comp.draftChangelog || `Release ${version}`,
      dependencies: comp.draftDependencies || {},
      peerDependencies: comp.draftPeerDependencies || {},
      files: comp.draftFiles || [],
      props: comp.draftProps || [],
      publishedAt: new Date().toISOString(),
      publishedBy: actorId,
    };

    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        await ComponentVersionModel.create({
          componentSlug: comp.slug,
          version,
          changelog: versionRecord.changelog,
          dependencies: versionRecord.dependencies,
          peerDependencies: versionRecord.peerDependencies,
          files: versionRecord.files,
          props: versionRecord.props,
          publishedAt: new Date(),
          publishedBy: actorId ? new mongoose.Types.ObjectId(actorId) : undefined,
        });

        await ComponentModel.updateOne(
          { slug: comp.slug },
          {
            $set: {
              status: 'published',
              currentVersion: version,
              'lastValidationResult.valid': true,
              'lastValidationResult.errors': [],
            },
          }
        );
      } catch (err: any) {
        if (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000)) {
          const immErr = new Error(`Version ${version} for "${comp.slug}" has already been published and is immutable.`);
          (immErr as any).statusCode = 409;
          (immErr as any).code = 'VERSION_IMMUTABLE';
          throw immErr;
        }
        console.warn('DB publishRelease failed, using memory:', err);
      }
    }

    // Persist immutable release manifest to registry storage
    try {
      const releaseManifest = createReleaseManifest({
        name: comp.name,
        slug: comp.slug,
        version,
        description: comp.description,
        category: comp.category,
        files: comp.draftFiles || [],
        dependencies: comp.draftDependencies || {},
        peerDependencies: comp.draftPeerDependencies || {},
        props: comp.draftProps || [],
        license: comp.license,
        author: comp.author,
        changelog: versionRecord.changelog,
        publishedAt: versionRecord.publishedAt,
      });
      if (s3RegistryStore) {
        await s3RegistryStore.publishRelease(releaseManifest);
      }
      await fileRegistryStore.publishRelease(releaseManifest);
    } catch (regErr: any) {
      if (regErr.code === 'VERSION_ALREADY_EXISTS') {
        const err = new Error(`Release ${comp.slug}@${version} already exists in registry storage and is immutable.`);
        (err as any).statusCode = 409;
        (err as any).code = 'VERSION_IMMUTABLE';
        throw err;
      }
      console.warn('File registry store write error (continuing):', regErr);
    }

    // Always update memory store too so fallback catalog is in sync
    memoryVersions.push(versionRecord);
    const updatedComp = await this.updateComponent(comp.slug, {
      status: 'published',
      currentVersion: version,
      lastValidationResult: {
        valid: true,
        errors: [],
        checkedAt: new Date().toISOString(),
      },
    });

    return {
      component: updatedComp!,
      version: versionRecord,
    };
  },

  async getVersions(slug: string): Promise<AdminVersionData[]> {
    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        const records = await ComponentVersionModel.find({ componentSlug: slug })
          .sort({ publishedAt: -1 })
          .lean();
        if (records && records.length > 0) {
          return records.map((v) => ({
            componentSlug: v.componentSlug,
            version: v.version,
            changelog: v.changelog,
            dependencies: v.dependencies instanceof Map ? Object.fromEntries(v.dependencies) : (v.dependencies as any) || {},
            peerDependencies: v.peerDependencies instanceof Map ? Object.fromEntries(v.peerDependencies) : (v.peerDependencies as any) || {},
            files: v.files,
            props: v.props,
            publishedAt: v.publishedAt instanceof Date ? v.publishedAt.toISOString() : String(v.publishedAt),
            deprecated: Boolean((v as any).deprecated),
            deprecationReason: (v as any).deprecationReason,
          }));
        }
      } catch (err) {
        console.warn('DB getVersions failed, using memory:', err);
      }
    }

    ensureMemoryInitialized();
    return memoryVersions
      .filter((v) => v.componentSlug === slug)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  },

  async deprecateVersion(slug: string, version: string, reason?: string): Promise<AdminVersionData | null> {
    const comp = await this.findBySlugOrId(slug);
    if (!comp) {
      throw new Error(`Component "${slug}" not found.`);
    }

    // 1. Update database if connected
    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        await ComponentVersionModel.updateOne(
          { componentSlug: comp.slug, version },
          { $set: { deprecated: true, deprecationReason: reason } }
        );
      } catch (err) {
        console.warn('DB deprecateVersion failed:', err);
      }
    }

    // 2. Update immutable static storage
    try {
      if (s3RegistryStore?.deprecateRelease) {
        await s3RegistryStore.deprecateRelease(comp.slug, version, reason);
      }
      await fileRegistryStore.deprecateRelease?.(comp.slug, version, reason);
    } catch (err) {
      console.warn('Registry storage deprecateRelease error:', err);
    }

    // 3. Update memory store
    ensureMemoryInitialized();
    const ver = memoryVersions.find((v) => v.componentSlug === comp.slug && v.version === version);
    if (ver) {
      ver.deprecated = true;
      ver.deprecationReason = reason;
    }

    return ver || null;
  },

  async recordAudit(data: {
    actorEmail: string;
    actorName: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details: Record<string, any>;
    ipAddress?: string;
  }) {
    const now = new Date().toISOString();
    const entry: AuditLogData = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorEmail: data.actorEmail,
      actorName: data.actorName,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      details: data.details,
      ipAddress: data.ipAddress,
      createdAt: now,
    };
    memoryAuditLogs.unshift(entry);

    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        await AuditLogModel.create({
          actorEmail: data.actorEmail,
          actorName: data.actorName,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          details: data.details,
          ipAddress: data.ipAddress,
        });
      } catch {
        // Safe silence
      }
    }
  },

  async queryAuditLogs(params: { action?: string; resourceType?: string; page?: number; limit?: number }) {
    const { action, resourceType, page = 1, limit = 25 } = params;
    const db = getDatabaseStatus();

    if (db.status === 'connected') {
      try {
        const filter: any = {};
        if (action) filter.action = action;
        if (resourceType) filter.resourceType = resourceType;

        const skip = (page - 1) * limit;
        const [total, logs] = await Promise.all([
          AuditLogModel.countDocuments(filter),
          AuditLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        ]);

        return {
          logs: logs.map((l) => ({
            id: (l as any)._id.toString(),
            action: l.action,
            actorEmail: l.actorEmail,
            actorName: l.actorName,
            resourceType: l.resourceType,
            resourceId: l.resourceId,
            details: l.details,
            createdAt: l.createdAt,
          })),
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        };
      } catch (err) {
        console.warn('DB queryAuditLogs failed, using memory:', err);
      }
    }

    let logs = [...memoryAuditLogs];
    if (action) logs = logs.filter((l) => l.action === action);
    if (resourceType) logs = logs.filter((l) => l.resourceType === resourceType);

    const total = logs.length;
    const skip = (page - 1) * limit;
    const paginated = logs.slice(skip, skip + limit);

    return {
      logs: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getAnalytics() {
    ensureMemoryInitialized();
    const all = Array.from(memoryComponents.values());

    const catMap = new Map<string, number>();
    const statusMap = new Map<string, number>();

    for (const c of all) {
      catMap.set(c.category, (catMap.get(c.category) || 0) + 1);
      statusMap.set(c.status, (statusMap.get(c.status) || 0) + 1);
    }

    const categoryDistribution = Array.from(catMap.entries()).map(([category, count]) => ({
      category,
      count,
    }));

    const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    return {
      categoryDistribution,
      statusDistribution,
      totalReleases: memoryVersions.length,
      recentReleases: memoryVersions.slice(-10).reverse(),
    };
  },

  async getAllVersions(): Promise<AdminVersionData[]> {
    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        const records = await ComponentVersionModel.find()
          .sort({ publishedAt: -1 })
          .limit(100)
          .lean();
        if (records && records.length > 0) {
          return records.map((v) => ({
            componentSlug: v.componentSlug,
            version: v.version,
            changelog: v.changelog,
            dependencies: v.dependencies instanceof Map ? Object.fromEntries(v.dependencies) : (v.dependencies as any) || {},
            peerDependencies: v.peerDependencies instanceof Map ? Object.fromEntries(v.peerDependencies) : (v.peerDependencies as any) || {},
            files: v.files,
            props: v.props,
            publishedAt: v.publishedAt instanceof Date ? v.publishedAt.toISOString() : String(v.publishedAt),
            deprecated: Boolean((v as any).deprecated),
            deprecationReason: (v as any).deprecationReason,
          }));
        }
      } catch (err) {
        console.warn('DB getAllVersions failed, using memory:', err);
      }
    }
    ensureMemoryInitialized();
    return [...memoryVersions].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  },

  async getUsers() {
    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        const users = await UserModel.find()
          .select('name email role avatarUrl codePreference themePreference createdAt updatedAt githubId googleId')
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
        return users.map((u) => ({
          id: (u as any)._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          avatarUrl: u.avatarUrl,
          codePreference: u.codePreference,
          themePreference: u.themePreference,
          hasGithub: Boolean(u.githubId),
          hasGoogle: Boolean(u.googleId),
          createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
          updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : String(u.updatedAt),
        }));
      } catch (err) {
        console.warn('DB getUsers failed:', err);
      }
    }
    return [
      {
        id: 'usr_admin_default',
        name: 'Administrator',
        email: 'admin@vac.dev',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  },

  async getConfig() {
    const db = getDatabaseStatus();
    let adminCount = 0;
    let totalUsers = 0;
    if (db.status === 'connected') {
      try {
        [adminCount, totalUsers] = await Promise.all([
          UserModel.countDocuments({ role: 'admin' }),
          UserModel.countDocuments(),
        ]);
      } catch {
        // Fall through
      }
    }

    const overview = await this.getOverview();

    return {
      version: '1.0.0',
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
      frontendUrl: env.FRONTEND_URL,
      database: {
        status: db.status,
        type: 'MongoDB Atlas',
        activePool: db.status === 'connected',
      },
      registryStorage: {
        driver: env.REGISTRY_STORAGE_DRIVER,
        s3Configured: Boolean(env.S3_BUCKET),
        s3Bucket: env.S3_BUCKET || null,
        s3Region: env.S3_REGION || 'us-east-1',
      },
      oauth: {
        github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
        google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
      },
      security: {
        jwtExpiresIn: env.JWT_EXPIRES_IN,
        bootstrapOpen: adminCount === 0,
      },
      stats: {
        adminCount,
        totalUsers,
        totalComponents: overview.totalComponents,
        publishedCount: overview.publishedCount,
      },
    };
  },
};

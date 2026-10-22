import { RegistryManifest, RegistryManifestSchema } from '@vac/shared';
import { createReleaseManifest, computeFileIntegrity, computeManifestIntegrity, LocalRegistryStore, S3RegistryStore, RegistryStore } from '@vac/registry';
import { getDatabaseStatus } from '../../config/database';
import { ComponentModel } from '../../models/Component';
import { ComponentVersionModel } from '../../models/ComponentVersion';
import { AdminStore } from '../admin/admin.store';
import { INITIAL_OFFICIAL_COMPONENTS } from '../components/components.seed';
import { AppError } from '../../middleware/errorHandler';
import { env } from '../../config/env';
import path from 'path';

// Singleton registry stores
const monorepoRoot = process.cwd().includes('backend')
  ? path.resolve(process.cwd(), '..')
  : process.cwd();
const defaultStorageDir = path.resolve(monorepoRoot, 'packages/registry/storage');
const storageDir = env.REGISTRY_STORAGE_DIR ? path.resolve(env.REGISTRY_STORAGE_DIR) : defaultStorageDir;
export const fileRegistryStore: RegistryStore = new LocalRegistryStore(storageDir);

export const s3RegistryStore: RegistryStore | null = env.S3_BUCKET
  ? new S3RegistryStore({
      bucket: env.S3_BUCKET,
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      prefix: env.S3_PREFIX,
    })
  : null;

export class RegistryService {
  /**
   * Resolves a release manifest by slug and version. Only published releases are returned.
   */
  static async getReleaseManifest(slug: string, version: string): Promise<RegistryManifest | null> {
    const cleanSlug = slug.toLowerCase();

    // 1. Try S3 storage if configured
    if (s3RegistryStore) {
      try {
        const s3Stored = await s3RegistryStore.getManifest(cleanSlug, version);
        if (s3Stored) return s3Stored;
      } catch {
        // Fall through
      }
    }

    // 2. Try fileRegistryStore (immutable persistent volume / cache)
    try {
      const stored = await fileRegistryStore.getManifest(cleanSlug, version);
      if (stored) return stored;
    } catch {
      // Fall through to database/memory
    }

    // 2. Try database if connected
    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        const comp = await ComponentModel.findOne({ slug: cleanSlug, status: 'published' }).lean();
        if (!comp) return null;

        const verRecord = await ComponentVersionModel.findOne({
          componentSlug: cleanSlug,
          version,
        }).lean();

        if (verRecord) {
          const deps = verRecord.dependencies instanceof Map
            ? Object.fromEntries(verRecord.dependencies)
            : (verRecord.dependencies as any) || {};

          const peerDeps = verRecord.peerDependencies instanceof Map
            ? Object.fromEntries(verRecord.peerDependencies)
            : (verRecord.peerDependencies as any) || {};

          const manifest = createReleaseManifest({
            name: comp.name,
            slug: cleanSlug,
            version: verRecord.version,
            description: comp.description,
            category: comp.category,
            files: verRecord.files,
            dependencies: deps,
            peerDependencies: peerDeps,
            props: verRecord.props,
            license: comp.license,
            author: comp.author,
            changelog: verRecord.changelog,
            publishedAt: verRecord.publishedAt instanceof Date ? verRecord.publishedAt.toISOString() : String(verRecord.publishedAt),
            deprecated: Boolean(comp.status === 'deprecated' || verRecord.deprecated),
            deprecationReason: verRecord.deprecationReason,
          });

          // Save to static file storage asynchronously for caching
          fileRegistryStore.publishRelease(manifest).catch(() => {});
          if (s3RegistryStore) {
            s3RegistryStore.publishRelease(manifest).catch(() => {});
          }
          return manifest;
        }
      } catch (err) {
        console.warn('DB getReleaseManifest failed, falling back to memory:', err);
      }
    }

    // 3. Fallback: Check AdminStore & INITIAL_OFFICIAL_COMPONENTS
    const memComp = await AdminStore.findBySlugOrId(cleanSlug);
    if (memComp && (memComp.status === 'published' || memComp.status === 'deprecated')) {
      const versions = await AdminStore.getVersions(cleanSlug);
      const targetVer = versions.find((v) => v.version === version);
      if (targetVer) {
        return createReleaseManifest({
          name: memComp.name,
          slug: cleanSlug,
          version: targetVer.version,
          description: memComp.description,
          category: memComp.category,
          files: targetVer.files,
          dependencies: targetVer.dependencies,
          peerDependencies: targetVer.peerDependencies,
          props: targetVer.props,
          license: memComp.license,
          author: memComp.author,
          changelog: targetVer.changelog,
          publishedAt: targetVer.publishedAt,
          deprecated: Boolean(memComp.status === 'deprecated' || (targetVer as any).deprecated),
          deprecationReason: (targetVer as any).deprecationReason,
        });
      }
    }

    // 4. Initial static catalog fallback
    const staticComp = INITIAL_OFFICIAL_COMPONENTS.find((c) => c.slug.toLowerCase() === cleanSlug);
    if (staticComp && staticComp.latestRelease && staticComp.latestRelease.version === version) {
      return createReleaseManifest({
        name: staticComp.name,
        slug: staticComp.slug,
        version: staticComp.latestRelease.version,
        description: staticComp.description,
        category: staticComp.category,
        files: staticComp.latestRelease.files,
        dependencies: staticComp.latestRelease.dependencies,
        peerDependencies: staticComp.latestRelease.peerDependencies,
        props: staticComp.latestRelease.props,
        license: staticComp.license,
        author: staticComp.author,
        changelog: staticComp.latestRelease.changelog,
        publishedAt: staticComp.createdAt,
      });
    }

    return null;
  }

  /**
   * Returns list of all published versions for a component.
   */
  static async listPublishedVersions(slug: string): Promise<string[]> {
    const cleanSlug = slug.toLowerCase();

    // Check file storage first
    try {
      const storedVersions = await fileRegistryStore.listVersions(cleanSlug);
      if (storedVersions.length > 0) return storedVersions;
    } catch {
      // Fall through
    }

    // Try database
    const db = getDatabaseStatus();
    if (db.status === 'connected') {
      try {
        const comp = await ComponentModel.findOne({ slug: cleanSlug, status: 'published' }).lean();
        if (!comp) return [];
        const versions = await ComponentVersionModel.find({ componentSlug: cleanSlug })
          .sort({ publishedAt: -1 })
          .select('version')
          .lean();
        return versions.map((v) => v.version);
      } catch (err) {
        console.warn('DB listPublishedVersions failed:', err);
      }
    }

    // Fallback: AdminStore & Seed
    const memComp = await AdminStore.findBySlugOrId(cleanSlug);
    if (memComp && (memComp.status === 'published' || memComp.status === 'deprecated')) {
      const versions = await AdminStore.getVersions(cleanSlug);
      return versions.map((v) => v.version);
    }

    const staticComp = INITIAL_OFFICIAL_COMPONENTS.find((c) => c.slug.toLowerCase() === cleanSlug);
    if (staticComp && staticComp.latestRelease) {
      return [staticComp.latestRelease.version];
    }

    return [];
  }

  /**
   * Returns rich details (version, publishedAt, changelog, deprecated status) for all published releases.
   */
  static async listPublishedVersionDetails(slug: string): Promise<Array<{
    version: string;
    publishedAt: string;
    changelog?: string;
    deprecated?: boolean;
    deprecationReason?: string;
  }>> {
    const versions = await this.listPublishedVersions(slug);
    const details: Array<{
      version: string;
      publishedAt: string;
      changelog?: string;
      deprecated?: boolean;
      deprecationReason?: string;
    }> = [];

    for (const v of versions) {
      const manifest = await this.getReleaseManifest(slug, v);
      if (manifest) {
        details.push({
          version: manifest.version,
          publishedAt: manifest.publishedAt,
          changelog: manifest.changelog,
          deprecated: manifest.deprecated,
          deprecationReason: manifest.deprecationReason,
        });
      }
    }

    return details;
  }

  /**
   * Returns the latest release manifest for a component.
   */
  static async getLatestReleaseManifest(slug: string): Promise<RegistryManifest | null> {
    const versions = await this.listPublishedVersions(slug);
    if (versions.length === 0) return null;

    // Use latest version (first in list or semver compare)
    const latestVersion = versions[0];
    return this.getReleaseManifest(slug, latestVersion);
  }

  /**
   * Compares two published versions of a component and returns detailed diffs.
   */
  static async compareReleases(slug: string, fromVersion: string, toVersion: string) {
    const fromManifest = await this.getReleaseManifest(slug, fromVersion);
    if (!fromManifest) {
      throw new AppError(
        `Source version "${fromVersion}" for component "${slug}" not found in registry.`,
        404,
        'VERSION_NOT_FOUND'
      );
    }

    const toManifest = await this.getReleaseManifest(slug, toVersion);
    if (!toManifest) {
      throw new AppError(
        `Target version "${toVersion}" for component "${slug}" not found in registry.`,
        404,
        'VERSION_NOT_FOUND'
      );
    }

    // 1. Metadata diff
    const metadata = {
      name: { from: fromManifest.name, to: toManifest.name, changed: fromManifest.name !== toManifest.name },
      description: { from: fromManifest.description, to: toManifest.description, changed: fromManifest.description !== toManifest.description },
      category: { from: fromManifest.category, to: toManifest.category, changed: fromManifest.category !== toManifest.category },
      license: { from: fromManifest.license, to: toManifest.license, changed: fromManifest.license !== toManifest.license },
      author: { from: fromManifest.author, to: toManifest.author, changed: fromManifest.author !== toManifest.author },
    };

    // 2. Dependencies diff
    const fromDeps = fromManifest.dependencies || {};
    const toDeps = toManifest.dependencies || {};
    const addedDeps: Record<string, string> = {};
    const removedDeps: Record<string, string> = {};
    const modifiedDeps: Record<string, { from: string; to: string }> = {};

    for (const [k, v] of Object.entries(toDeps)) {
      if (!(k in fromDeps)) {
        addedDeps[k] = v;
      } else if (fromDeps[k] !== v) {
        modifiedDeps[k] = { from: fromDeps[k], to: v };
      }
    }
    for (const [k, v] of Object.entries(fromDeps)) {
      if (!(k in toDeps)) {
        removedDeps[k] = v;
      }
    }

    // 3. Peer dependencies diff
    const fromPeer = fromManifest.peerDependencies || {};
    const toPeer = toManifest.peerDependencies || {};
    const addedPeer: Record<string, string> = {};
    const removedPeer: Record<string, string> = {};
    const modifiedPeer: Record<string, { from: string; to: string }> = {};

    for (const [k, v] of Object.entries(toPeer)) {
      if (!(k in fromPeer)) {
        addedPeer[k] = v;
      } else if (fromPeer[k] !== v) {
        modifiedPeer[k] = { from: fromPeer[k], to: v };
      }
    }
    for (const [k, v] of Object.entries(fromPeer)) {
      if (!(k in toPeer)) {
        removedPeer[k] = v;
      }
    }

    // 4. Props diff
    const fromProps = fromManifest.props || [];
    const toProps = toManifest.props || [];
    const fromPropsMap = new Map(fromProps.map((p) => [p.name, p]));
    const toPropsMap = new Map(toProps.map((p) => [p.name, p]));

    const addedProps = toProps.filter((p) => !fromPropsMap.has(p.name));
    const removedProps = fromProps.filter((p) => !toPropsMap.has(p.name));
    const modifiedProps: Array<{ name: string; from: any; to: any }> = [];

    for (const [name, toP] of toPropsMap.entries()) {
      const fromP = fromPropsMap.get(name);
      if (fromP && (fromP.type !== toP.type || fromP.required !== toP.required || fromP.defaultValue !== toP.defaultValue || fromP.description !== toP.description)) {
        modifiedProps.push({ name, from: fromP, to: toP });
      }
    }

    // 5. Files diff with line-level diff calculation
    const fromFilesMap = new Map(fromManifest.files.map((f) => [f.path, f]));
    const toFilesMap = new Map(toManifest.files.map((f) => [f.path, f]));
    const allPaths = Array.from(new Set([...fromFilesMap.keys(), ...toFilesMap.keys()])).sort();

    const filesDiff: Array<{
      path: string;
      name: string;
      language: string;
      status: 'added' | 'removed' | 'modified' | 'unchanged';
      oldContent?: string;
      newContent?: string;
      lineDiff?: Array<{ type: 'add' | 'del' | 'eq'; line: string }>;
    }> = [];

    let filesAdded = 0;
    let filesRemoved = 0;
    let filesModified = 0;
    let filesUnchanged = 0;

    for (const p of allPaths) {
      const fromF = fromFilesMap.get(p);
      const toF = toFilesMap.get(p);

      if (!fromF && toF) {
        filesAdded++;
        const lines = toF.content.split('\n').map((l) => ({ type: 'add' as const, line: l }));
        filesDiff.push({
          path: p,
          name: toF.name,
          language: toF.language,
          status: 'added',
          newContent: toF.content,
          lineDiff: lines,
        });
      } else if (fromF && !toF) {
        filesRemoved++;
        const lines = fromF.content.split('\n').map((l) => ({ type: 'del' as const, line: l }));
        filesDiff.push({
          path: p,
          name: fromF.name,
          language: fromF.language,
          status: 'removed',
          oldContent: fromF.content,
          lineDiff: lines,
        });
      } else if (fromF && toF) {
        if (fromF.content === toF.content) {
          filesUnchanged++;
          filesDiff.push({
            path: p,
            name: toF.name,
            language: toF.language,
            status: 'unchanged',
            oldContent: fromF.content,
            newContent: toF.content,
          });
        } else {
          filesModified++;
          const lineDiff = computeLineDiff(fromF.content, toF.content);
          filesDiff.push({
            path: p,
            name: toF.name,
            language: toF.language,
            status: 'modified',
            oldContent: fromF.content,
            newContent: toF.content,
            lineDiff,
          });
        }
      }
    }

    return {
      slug,
      fromVersion,
      toVersion,
      metadata,
      changelog: toManifest.changelog || `Release ${toVersion}`,
      fromDeprecated: fromManifest.deprecated || false,
      toDeprecated: toManifest.deprecated || false,
      toDeprecationReason: toManifest.deprecationReason,
      dependencies: {
        added: addedDeps,
        removed: removedDeps,
        modified: modifiedDeps,
      },
      peerDependencies: {
        added: addedPeer,
        removed: removedPeer,
        modified: modifiedPeer,
      },
      props: {
        added: addedProps,
        removed: removedProps,
        modified: modifiedProps,
      },
      styling: {
        framework: {
          from: fromManifest.styling?.framework || 'tailwind',
          to: toManifest.styling?.framework || 'tailwind',
          changed: fromManifest.styling?.framework !== toManifest.styling?.framework,
        },
        requiredCssChanged: fromManifest.styling?.requiredCss !== toManifest.styling?.requiredCss,
      },
      files: filesDiff,
      summary: {
        filesAdded,
        filesRemoved,
        filesModified,
        filesUnchanged,
        dependenciesChanged: Object.keys(addedDeps).length + Object.keys(removedDeps).length + Object.keys(modifiedDeps).length,
        propsChanged: addedProps.length + removedProps.length + modifiedProps.length,
      },
    };
  }
}

/**
 * Computes line-by-line diff between two text documents using LCS algorithm.
 */
export function computeLineDiff(
  oldContent: string,
  newContent: string
): Array<{ type: 'add' | 'del' | 'eq'; line: string }> {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const m = oldLines.length;
  const n = newLines.length;

  // Cap LCS computation on extremely large files for performance
  if (m > 1500 || n > 1500) {
    return [
      ...oldLines.map((l) => ({ type: 'del' as const, line: l })),
      ...newLines.map((l) => ({ type: 'add' as const, line: l })),
    ];
  }

  // 2D dynamic programming table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (oldLines[i] === newLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to assemble diff
  let i = m;
  let j = n;
  const diff: Array<{ type: 'add' | 'del' | 'eq'; line: string }> = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diff.unshift({ type: 'eq', line: oldLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: 'add', line: newLines[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({ type: 'del', line: oldLines[i - 1] });
      i--;
    }
  }

  return diff;
}

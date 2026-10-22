import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { RegistryManifest, RegistryManifestSchema, ComponentFile, ComponentProp } from '@vac/shared';

export const REGISTRY_SCHEMA_VERSION = '1.0.0';

export function computeFileIntegrity(content: string): string {
  const hash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  return `sha256-${hash}`;
}

export function computeManifestIntegrity(manifest: Omit<RegistryManifest, 'integrity'>): string {
  const payload = JSON.stringify({
    name: manifest.name,
    slug: manifest.slug,
    version: manifest.version,
    files: manifest.files.map((f) => ({ path: f.path, integrity: f.integrity || computeFileIntegrity(f.content) })),
    dependencies: manifest.dependencies,
  });
  const hash = crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
  return `sha256-${hash}`;
}

export function createReleaseManifest(params: {
  name: string;
  slug: string;
  version: string;
  description: string;
  category: string;
  files: ComponentFile[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  props?: ComponentProp[];
  styling?: { framework: 'tailwind' | 'css' | 'none'; cssVariables?: Record<string, string>; requiredCss?: string };
  setupInstructions?: string;
  license?: string;
  author?: string;
  changelog?: string;
  publishedAt?: string;
  deprecated?: boolean;
  deprecationReason?: string;
}): RegistryManifest {
  // Enrich each file with integrity hash if not present
  const enrichedFiles = params.files.map((f) => ({
    ...f,
    integrity: f.integrity || computeFileIntegrity(f.content),
  }));

  const entryFile = enrichedFiles.find((f) => f.isEntry) || enrichedFiles[0];

  const candidate = {
    schemaVersion: '1.0.0' as const,
    name: params.name,
    slug: params.slug,
    version: params.version,
    description: params.description,
    category: params.category,
    entryPoint: entryFile ? entryFile.path : undefined,
    dependencies: params.dependencies || {},
    devDependencies: params.devDependencies || {},
    peerDependencies: params.peerDependencies || {},
    files: enrichedFiles,
    props: params.props || [],
    styling: params.styling || { framework: 'tailwind' as const },
    setupInstructions: params.setupInstructions,
    license: params.license || 'MIT',
    author: params.author || 'VAC Team',
    changelog: params.changelog || `Release ${params.version}`,
    publishedAt: params.publishedAt || new Date().toISOString(),
    deprecated: params.deprecated || false,
    deprecationReason: params.deprecationReason,
  };

  const integrity = computeManifestIntegrity(candidate);
  const validated = RegistryManifestSchema.parse({
    ...candidate,
    integrity,
  });

  return validated;
}

export interface RegistryStore {
  getManifest(slug: string, version: string): Promise<RegistryManifest | null>;
  getLatestManifest(slug: string): Promise<RegistryManifest | null>;
  listVersions(slug: string): Promise<string[]>;
  publishRelease(manifest: RegistryManifest): Promise<void>;
  deprecateRelease?(slug: string, version: string, reason?: string): Promise<void>;
}

export function compareSemverDesc(a: string, b: string): number {
  const pa = a.split('-')[0].split('.').map(Number);
  const pb = b.split('-')[0].split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = isNaN(pa[i]) ? 0 : pa[i];
    const nb = isNaN(pb[i]) ? 0 : pb[i];
    if (na !== nb) return nb - na;
  }
  return b.localeCompare(a);
}

export class MemoryRegistryStore implements RegistryStore {
  private store = new Map<string, Map<string, RegistryManifest>>();

  async getManifest(slug: string, version: string): Promise<RegistryManifest | null> {
    const versions = this.store.get(slug.toLowerCase());
    if (!versions) return null;
    return versions.get(version) || null;
  }

  async getLatestManifest(slug: string): Promise<RegistryManifest | null> {
    const versions = this.store.get(slug.toLowerCase());
    if (!versions || versions.size === 0) return null;
    const sorted = Array.from(versions.values()).sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return sorted[0] || null;
  }

  async listVersions(slug: string): Promise<string[]> {
    const versions = this.store.get(slug.toLowerCase());
    if (!versions) return [];
    return Array.from(versions.keys()).sort(compareSemverDesc);
  }

  async publishRelease(manifest: RegistryManifest): Promise<void> {
    const slug = manifest.slug.toLowerCase();
    let versions = this.store.get(slug);
    if (!versions) {
      versions = new Map();
      this.store.set(slug, versions);
    }

    if (versions.has(manifest.version)) {
      const err = new Error(`Version ${manifest.version} for component "${slug}" is immutable and already exists.`);
      (err as any).code = 'VERSION_ALREADY_EXISTS';
      throw err;
    }

    versions.set(manifest.version, manifest);
  }

  async deprecateRelease(slug: string, version: string, reason?: string): Promise<void> {
    const manifest = await this.getManifest(slug, version);
    if (manifest) {
      manifest.deprecated = true;
      manifest.deprecationReason = reason;
    }
  }
}

export class LocalRegistryStore implements RegistryStore {
  private storageDir: string;

  constructor(storageDir?: string) {
    this.storageDir = storageDir || path.resolve(process.cwd(), 'packages/registry/storage');
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  private getComponentDir(slug: string): string {
    return path.join(this.storageDir, slug.toLowerCase());
  }

  private getManifestPath(slug: string, version: string): string {
    return path.join(this.getComponentDir(slug), `${version}.json`);
  }

  async getManifest(slug: string, version: string): Promise<RegistryManifest | null> {
    const filePath = this.getManifestPath(slug, version);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);
      return RegistryManifestSchema.parse(data);
    } catch (err) {
      console.warn(`Failed to read manifest for ${slug}@${version}:`, err);
      return null;
    }
  }

  async listVersions(slug: string): Promise<string[]> {
    const dir = this.getComponentDir(slug);
    if (!fs.existsSync(dir)) {
      return [];
    }
    const files = fs.readdirSync(dir);
    return files
      .filter((f: string) => f.endsWith('.json'))
      .map((f: string) => f.replace(/\.json$/, ''))
      .sort(compareSemverDesc);
  }

  async getLatestManifest(slug: string): Promise<RegistryManifest | null> {
    const versions = await this.listVersions(slug);
    if (versions.length === 0) return null;

    let latest: RegistryManifest | null = null;
    for (const v of versions) {
      const m = await this.getManifest(slug, v);
      if (m) {
        if (!latest || new Date(m.publishedAt).getTime() > new Date(latest.publishedAt).getTime()) {
          latest = m;
        }
      }
    }
    return latest;
  }

  async publishRelease(manifest: RegistryManifest): Promise<void> {
    const dir = this.getComponentDir(manifest.slug);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = this.getManifestPath(manifest.slug, manifest.version);
    if (fs.existsSync(filePath)) {
      const err = new Error(`Release ${manifest.slug}@${manifest.version} already exists and is immutable.`);
      (err as any).code = 'VERSION_ALREADY_EXISTS';
      throw err;
    }

    // Atomic write via temp file
    const tmpPath = `${filePath}.${Date.now()}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(manifest, null, 2), 'utf8');
    fs.renameSync(tmpPath, filePath);
  }

  async deprecateRelease(slug: string, version: string, reason?: string): Promise<void> {
    const manifest = await this.getManifest(slug, version);
    if (!manifest) return;
    manifest.deprecated = true;
    manifest.deprecationReason = reason;
    const filePath = this.getManifestPath(slug, version);
    fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2), 'utf8');
  }
}

export interface S3RegistryConfig {
  bucket: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  prefix?: string;
  fetchFn?: typeof fetch;
}

export class S3RegistryStore implements RegistryStore {
  private bucket: string;
  private region: string;
  private endpoint: string;
  private accessKeyId?: string;
  private secretAccessKey?: string;
  private prefix: string;
  private fetchFn: typeof fetch;

  constructor(config: S3RegistryConfig) {
    this.bucket = config.bucket;
    this.region = config.region || 'us-east-1';
    this.endpoint = config.endpoint || `https://${config.bucket}.s3.${this.region}.amazonaws.com`;
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
    this.prefix = config.prefix ? config.prefix.replace(/\/+$/, '') + '/' : '';
    this.fetchFn = config.fetchFn || (typeof fetch !== 'undefined' ? fetch : globalThis.fetch);
  }

  private getKey(slug: string, version: string): string {
    return `${this.prefix}${slug.toLowerCase()}/${version}.json`;
  }

  private getUrl(key: string): string {
    const base = this.endpoint.replace(/\/+$/, '');
    return `${base}/${key.replace(/^\/+/, '')}`;
  }

  async getManifest(slug: string, version: string): Promise<RegistryManifest | null> {
    const key = this.getKey(slug, version);
    const url = this.getUrl(key);

    try {
      const res = await this.fetchFn(url, { method: 'GET' });
      if (res.status === 404) return null;
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      return RegistryManifestSchema.parse(data);
    } catch {
      return null;
    }
  }

  async getLatestManifest(slug: string): Promise<RegistryManifest | null> {
    const versions = await this.listVersions(slug);
    if (versions.length === 0) return null;
    return this.getManifest(slug, versions[0]);
  }

  async listVersions(_slug: string): Promise<string[]> {
    return [];
  }

  async publishRelease(manifest: RegistryManifest): Promise<void> {
    const key = this.getKey(manifest.slug, manifest.version);
    const existing = await this.getManifest(manifest.slug, manifest.version);
    if (existing) {
      const err = new Error(`Release ${manifest.slug}@${manifest.version} already exists in S3 storage and is immutable.`);
      (err as any).code = 'VERSION_ALREADY_EXISTS';
      throw err;
    }

    const url = this.getUrl(key);
    const payload = JSON.stringify(manifest, null, 2);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    if (manifest.integrity) {
      headers['x-amz-meta-integrity'] = manifest.integrity;
    }

    const res = await this.fetchFn(url, {
      method: 'PUT',
      headers,
      body: payload,
    });

    if (!res.ok && res.status !== 200 && res.status !== 201) {
      throw new Error(`Failed to write release to S3 storage (${res.status})`);
    }
  }

  async deprecateRelease(slug: string, version: string, reason?: string): Promise<void> {
    const manifest = await this.getManifest(slug, version);
    if (!manifest) return;
    manifest.deprecated = true;
    manifest.deprecationReason = reason;

    const key = this.getKey(slug, version);
    const url = this.getUrl(key);
    await this.fetchFn(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(manifest, null, 2),
    });
  }
}

export const defaultRegistryStore: RegistryStore = new MemoryRegistryStore();

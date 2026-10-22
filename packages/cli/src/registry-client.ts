import { RegistryManifest, RegistryManifestSchema } from '@vac/shared';
import { fileRegistryStore } from './mock-registry'; // fallback if offline or in tests

export interface RegistryComponentSummary {
  name: string;
  slug: string;
  description: string;
  category: string;
  latestVersion: string;
  versions: string[];
  manifestUrl: string;
  integrity?: string;
  publishedAt: string;
  deprecated?: boolean;
}

const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9a-zA-Z.-]+))?(?:\+([0-9a-zA-Z.-]+))?$/;

export class RegistryClient {
  private registryUrl: string;

  constructor(registryUrl = 'http://localhost:4000/api/registry') {
    const cleaned = (registryUrl || '').trim().replace(/\/$/, '');
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      throw new Error(
        `Invalid registry URL "${registryUrl}". Registry URL must start with http:// or https://.`
      );
    }
    this.registryUrl = cleaned;
  }

  async getComponentSummary(slug: string): Promise<RegistryComponentSummary> {
    const cleanSlug = slug.toLowerCase().trim();
    const url = `${this.registryUrl}/components/${cleanSlug}`;

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.status === 404) {
        throw new Error(`Component "${cleanSlug}" was not found in the VAC registry.`);
      }
      if (!res.ok) {
        throw new Error(`Registry returned HTTP ${res.status}: ${res.statusText}`);
      }
      const text = await res.text();
      if (Buffer.byteLength(text, 'utf8') > 5 * 1024 * 1024) {
        throw new Error('Response from registry exceeds maximum allowable size limit of 5MB.');
      }
      const json = JSON.parse(text);
      if (!json.success || !json.data) {
        throw new Error(json.error?.message || 'Invalid response from registry.');
      }
      return json.data;
    } catch (err: any) {
      if (err.message?.includes('was not found in the VAC registry')) {
        throw err;
      }
      // If network fetch fails (e.g. backend server not running during test fixture or offline),
      // attempt resolving via fallback registry store
      const local = await fileRegistryStore?.getLatestManifest?.(cleanSlug);
      if (local) {
        const storedVersions = (await fileRegistryStore?.listVersions?.(cleanSlug)) || [local.version];
        return {
          name: local.name,
          slug: local.slug,
          description: local.description,
          category: local.category,
          latestVersion: local.version,
          versions: storedVersions,
          manifestUrl: `/components/${cleanSlug}/${local.version}`,
          integrity: local.integrity,
          publishedAt: local.publishedAt,
          deprecated: local.deprecated,
        };
      }
      if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
        throw new Error(
          `Registry request timed out after 8000ms. Check your network connection or verify registry URL at "${this.registryUrl}".`
        );
      }
      throw new Error(
        `Failed to connect to registry at ${this.registryUrl}: ${err.message}. Recovery tip: verify the backend dev server is running or set VAC_REGISTRY_URL.`
      );
    }
  }

  async getReleaseManifest(slug: string, version?: string): Promise<RegistryManifest> {
    const cleanSlug = slug.toLowerCase().trim();

    // 1. If version is specified, validate semver format
    let targetVersion = version?.trim();

    if (targetVersion && targetVersion !== 'latest') {
      if (!SEMVER_REGEX.test(targetVersion)) {
        let availableVersions = '';
        try {
          const summary = await this.getComponentSummary(cleanSlug);
          if (summary.versions?.length) {
            availableVersions = ` Available versions: ${summary.versions.join(', ')}.`;
          }
        } catch {
          // Ignore
        }
        throw new Error(
          `Invalid version format "${targetVersion}". Version must follow semver format (e.g. 1.0.0).${availableVersions}`
        );
      }
    } else {
      const summary = await this.getComponentSummary(cleanSlug);
      targetVersion = summary.latestVersion;
    }

    const url = `${this.registryUrl}/components/${cleanSlug}/${targetVersion}`;

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.status === 404) {
        let availableVersions = '';
        try {
          const summary = await this.getComponentSummary(cleanSlug);
          if (summary.versions?.length) {
            availableVersions = ` Available versions: ${summary.versions.join(', ')}.`;
          }
        } catch {
          // Ignore
        }
        throw new Error(
          `Version "${targetVersion}" for component "${cleanSlug}" was not found in the VAC registry.${availableVersions}`
        );
      }
      if (!res.ok) {
        throw new Error(`Registry returned HTTP ${res.status}: ${res.statusText}`);
      }
      const text = await res.text();
      if (Buffer.byteLength(text, 'utf8') > 5 * 1024 * 1024) {
        throw new Error('Response from registry exceeds maximum allowable size limit of 5MB.');
      }
      const json = JSON.parse(text);
      const rawManifest = json.data || json;
      return RegistryManifestSchema.parse(rawManifest);
    } catch (err: any) {
      if (
        err.message?.includes('was not found in the VAC registry') ||
        err.message?.includes('Invalid version format')
      ) {
        throw err;
      }

      // Offline / test fixture fallback
      const local = await fileRegistryStore?.getManifest?.(cleanSlug, targetVersion);
      if (local) {
        return RegistryManifestSchema.parse(local);
      }

      // Check if fileRegistryStore has other versions to report
      const localVersions = await fileRegistryStore?.listVersions?.(cleanSlug);
      if (localVersions && localVersions.length > 0) {
        throw new Error(
          `Version "${targetVersion}" for component "${cleanSlug}" was not found in the registry. Available versions: ${localVersions.join(', ')}.`
        );
      }

      if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
        throw new Error(
          `Registry request timed out after 8000ms. Check your network connection or verify registry URL at "${this.registryUrl}".`
        );
      }

      throw err;
    }
  }
}

import { describe, it, expect } from 'vitest';
import {
  computeFileIntegrity,
  createReleaseManifest,
  MemoryRegistryStore,
} from './index';

describe('Registry Store and Manifest Integrity Tests', () => {
  it('computes deterministic sha256 file integrity', () => {
    const content = 'export const Button = () => <button>Click</button>;';
    const hash1 = computeFileIntegrity(content);
    const hash2 = computeFileIntegrity(content);
    expect(hash1).toBe(hash2);
    expect(hash1.startsWith('sha256-')).toBe(true);
  });

  it('generates a valid release manifest conforming to RegistryManifestSchema', () => {
    const manifest = createReleaseManifest({
      name: 'Glass Pill Button',
      slug: 'glass-button',
      version: '1.0.0',
      description: 'Tactile glassmorphic pill button with glow states',
      category: 'Buttons & Controls',
      files: [
        {
          path: 'src/components/GlassButton.tsx',
          name: 'GlassButton.tsx',
          content: 'import React from "react";\nexport const GlassButton = () => <button>Glass</button>;',
          language: 'typescript',
          isEntry: true,
        },
      ],
      dependencies: { 'lucide-react': '^1.0.0' },
      styling: { framework: 'tailwind' },
    });

    expect(manifest.schemaVersion).toBe('1.0.0');
    expect(manifest.slug).toBe('glass-button');
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.files[0].integrity).toBeDefined();
    expect(manifest.integrity).toBeDefined();
    expect(manifest.deprecated).toBe(false);
  });

  it('stores immutable release and rejects re-publishing identical version', async () => {
    const store = new MemoryRegistryStore();

    const manifest = createReleaseManifest({
      name: 'Interactive Pricing',
      slug: 'interactive-pricing',
      version: '1.0.0',
      description: 'Pricing tables with billing frequency toggles',
      category: 'Marketing & Sales',
      files: [
        {
          path: 'src/components/Pricing.tsx',
          name: 'Pricing.tsx',
          content: 'export const Pricing = () => <div>Pricing</div>;',
          language: 'typescript',
          isEntry: true,
        },
      ],
    });

    await store.publishRelease(manifest);

    // Retrieve
    const fetched = await store.getManifest('interactive-pricing', '1.0.0');
    expect(fetched).toBeDefined();
    expect(fetched?.slug).toBe('interactive-pricing');

    // Attempting to overwrite must fail
    await expect(store.publishRelease(manifest)).rejects.toThrow(
      /immutable and already exists/
    );
  });

  it('correctly resolves latest release from published versions', async () => {
    const store = new MemoryRegistryStore();

    const m1 = createReleaseManifest({
      name: 'Analytics Dashboard',
      slug: 'analytics-dashboard',
      version: '1.0.0',
      description: 'Analytics widgets',
      category: 'Data & Dashboards',
      files: [{ path: 'index.tsx', name: 'index.tsx', content: 'v1', language: 'typescript', isEntry: true }],
      publishedAt: '2026-01-01T00:00:00.000Z',
    });

    const m2 = createReleaseManifest({
      name: 'Analytics Dashboard',
      slug: 'analytics-dashboard',
      version: '1.1.0',
      description: 'Analytics widgets updated',
      category: 'Data & Dashboards',
      files: [{ path: 'index.tsx', name: 'index.tsx', content: 'v2', language: 'typescript', isEntry: true }],
      publishedAt: '2026-02-01T00:00:00.000Z',
    });

    await store.publishRelease(m1);
    await store.publishRelease(m2);

    const versions = await store.listVersions('analytics-dashboard');
    expect(versions).toContain('1.0.0');
    expect(versions).toContain('1.1.0');

    const latest = await store.getLatestManifest('analytics-dashboard');
    expect(latest?.version).toBe('1.1.0');
  });

  it('S3RegistryStore publishes, retrieves, and enforces immutability via S3 interface', async () => {
    const s3Storage = new Map<string, string>();

    const mockFetch = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const urlStr = url.toString();
      const method = init?.method || 'GET';

      if (method === 'GET') {
        const data = s3Storage.get(urlStr);
        if (!data) {
          return new Response('Not Found', { status: 404 });
        }
        return new Response(data, { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (method === 'PUT') {
        s3Storage.set(urlStr, init?.body as string);
        return new Response('OK', { status: 200 });
      }

      return new Response('Method Not Allowed', { status: 405 });
    };

    const s3Store = new (await import('./index')).S3RegistryStore({
      bucket: 'test-vac-registry',
      region: 'us-east-1',
      endpoint: 'https://test-vac-registry.s3.us-east-1.amazonaws.com',
      fetchFn: mockFetch as any,
    });

    const manifest = createReleaseManifest({
      name: 'Glass Button',
      slug: 'glass-button',
      version: '1.0.0',
      description: 'Glass Button',
      category: 'Buttons',
      files: [{ path: 'index.tsx', name: 'index.tsx', content: 'button code', language: 'typescript', isEntry: true }],
    });

    // 1. Publish to S3
    await s3Store.publishRelease(manifest);

    // 2. Retrieve from S3
    const retrieved = await s3Store.getManifest('glass-button', '1.0.0');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.slug).toBe('glass-button');
    expect(retrieved?.version).toBe('1.0.0');

    // 3. Immutability: Re-publishing identical version must be rejected
    await expect(s3Store.publishRelease(manifest)).rejects.toThrow(/already exists in S3 storage and is immutable/);

    // 4. Deprecate release
    await s3Store.deprecateRelease('glass-button', '1.0.0', 'Superseded by v2');
    const updated = await s3Store.getManifest('glass-button', '1.0.0');
    expect(updated?.deprecated).toBe(true);
    expect(updated?.deprecationReason).toBe('Superseded by v2');
  });
});

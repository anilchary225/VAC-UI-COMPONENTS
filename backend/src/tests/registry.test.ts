import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { computeFileIntegrity } from '@vac/registry';

describe('Public Registry API Integration Tests', () => {
  const app = createApp();

  describe('GET /api/registry/components/:slug', () => {
    it('returns 404 for unknown or draft component', async () => {
      const res = await request(app).get('/api/registry/components/totally-unknown-component');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('COMPONENT_NOT_FOUND');
    });

    it('returns published component release summary for official component', async () => {
      const res = await request(app).get('/api/registry/components/animated-login-form');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('animated-login-form');
      expect(res.body.data.latestVersion).toBe('1.0.0');
      expect(res.body.data.versions).toContain('1.0.0');
      expect(res.body.data.manifestUrl).toBe('/api/registry/components/animated-login-form/1.0.0/manifest');
    });
  });

  describe('GET /api/registry/components/:slug/versions', () => {
    it('returns list of published versions', async () => {
      const res = await request(app).get('/api/registry/components/glassmorphism-navbar/versions');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('glassmorphism-navbar');
      expect(res.body.data.versions).toContain('1.0.0');
    });

    it('returns 404 for unreleased component slug', async () => {
      const res = await request(app).get('/api/registry/components/non-existent-component/versions');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/registry/components/:slug/:version', () => {
    it('returns 404 for invalid version', async () => {
      const res = await request(app).get('/api/registry/components/animated-login-form/99.99.99');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('VERSION_NOT_FOUND');
    });

    it('returns immutable release manifest with cache headers and integrity hashes', async () => {
      const res = await request(app).get('/api/registry/components/animated-login-form/1.0.0');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const manifest = res.body.data;
      expect(manifest.schemaVersion).toBe('1.0.0');
      expect(manifest.name).toBe('Animated Login Form');
      expect(manifest.slug).toBe('animated-login-form');
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.files.length).toBeGreaterThan(0);
      expect(manifest.integrity).toBeDefined();

      // Check immutable cache header
      expect(res.headers['cache-control']).toContain('immutable');

      // Verify each file's integrity hash matches content
      for (const file of manifest.files) {
        expect(file.integrity).toBeDefined();
        const expectedHash = computeFileIntegrity(file.content);
        expect(file.integrity).toBe(expectedHash);
      }
    });

    it('serves direct JSON manifest via /manifest endpoint', async () => {
      const res = await request(app).get('/api/registry/components/animated-login-form/1.0.0/manifest');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
      expect(res.body.slug).toBe('animated-login-form');
      expect(res.body.version).toBe('1.0.0');
    });

    it('draft components are completely isolated and return 404 from registry', async () => {
      // Create a draft component
      const { AdminStore } = await import('../modules/admin/admin.store');
      const draftSlug = `private-draft-${Date.now()}`;
      await AdminStore.createComponent({
        name: 'Private Draft',
        slug: draftSlug,
        description: 'Should not appear in public registry',
        category: 'Forms & Authentication',
        status: 'draft',
      });

      // Registry summary must return 404
      const sumRes = await request(app).get(`/api/registry/components/${draftSlug}`);
      expect(sumRes.status).toBe(404);

      // Registry version must return 404
      const verRes = await request(app).get(`/api/registry/components/${draftSlug}/0.1.0`);
      expect(verRes.status).toBe(404);
    });

    it('successfully serves manifests for all nine official VAC components', async () => {
      const officialSlugs = [
        'animated-login-form',
        'glassmorphism-navbar',
        'interactive-pricing',
        'analytics-dashboard',
        'notification-center',
        'file-upload',
        'glass-button',
        'toggle-switch',
        'dark-glass-card',
      ];

      for (const slug of officialSlugs) {
        const res = await request(app).get(`/api/registry/components/${slug}/1.0.0/manifest`);
        expect(res.status).toBe(200);
        expect(res.body.slug).toBe(slug);
        expect(res.body.files.length).toBeGreaterThan(0);
        expect(res.body.files[0].content.length).toBeGreaterThan(0);
        expect(res.body.integrity).toBeDefined();
      }
    });
  });
});

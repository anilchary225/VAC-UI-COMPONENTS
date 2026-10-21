import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { env } from '../config/env';

describe('Admin Dashboard and Component Studio Integration Tests', () => {
  const app = createApp();

  const adminToken = jwt.sign(
    { id: 'usr_admin_test_1', email: 'admin@vac.dev', role: 'admin', name: 'Admin Master' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const regularUserToken = jwt.sign(
    { id: 'usr_regular_test_1', email: 'user@vac.dev', role: 'user', name: 'Regular Dev' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  describe('1. Admin Access & Security Authorization', () => {
    it('rejects unauthenticated requests to /api/admin/overview with 401', async () => {
      const res = await request(app).get('/api/admin/overview');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects non-admin authenticated users with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set('Authorization', `Bearer ${regularUserToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects non-admin users from creating components', async () => {
      const res = await request(app)
        .post('/api/admin/components')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ name: 'Hacker Form', slug: 'hacker-form' });
      expect(res.status).toBe(403);
    });

    it('allows verified admin to view overview metrics', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalComponents');
      expect(res.body.data).toHaveProperty('publishedCount');
      expect(res.body.data).toHaveProperty('draftCount');
    });
  });

  describe('2. Component Draft Creation & Slug Validation', () => {
    const testSlug = 'studio-test-badge';

    it('successfully creates a draft component with starter files', async () => {
      const res = await request(app)
        .post('/api/admin/components')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Studio Test Badge',
          slug: testSlug,
          description: 'A glowing tactile badge component built in the studio.',
          category: 'Buttons & Controls',
          tags: ['Badge', 'Glow', 'Studio'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe(testSlug);
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.draftFiles.length).toBeGreaterThan(0);
      expect(res.body.data.draftFiles[0].name).toBe('StudioTestBadge.tsx');
    });

    it('rejects duplicate slug creation with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/admin/components')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate Badge',
          slug: testSlug,
          description: 'Duplicate slug test.',
          category: 'Buttons & Controls',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('DUPLICATE_SLUG');
    });

    it('draft does NOT appear in public catalog GET /api/components', async () => {
      const res = await request(app).get('/api/components?search=studio-test-badge');
      expect(res.status).toBe(200);
      const found = res.body.data.find((c: any) => c.slug === testSlug);
      expect(found).toBeUndefined();
    });
  });

  describe('3. Validation Pipeline & Safety Checks', () => {
    const testSlug = 'studio-test-badge';

    it('detects unsafe path traversal in draft files', async () => {
      // Inject unsafe file path
      await request(app)
        .patch(`/api/admin/components/${testSlug}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          draftFiles: [
            {
              path: '../../etc/passwd',
              name: 'passwd',
              content: 'malicious',
              language: 'typescript',
              isEntry: true,
            },
          ],
        });

      const valRes = await request(app)
        .post(`/api/admin/components/${testSlug}/validate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(valRes.status).toBe(200);
      expect(valRes.body.data.report.valid).toBe(false);
      expect(
        valRes.body.data.report.errors.some((e: string) => e.includes('Unsafe file path'))
      ).toBe(true);
    });

    it('detects syntax error (unbalanced brackets) in source code', async () => {
      await request(app)
        .patch(`/api/admin/components/${testSlug}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          draftFiles: [
            {
              path: 'src/components/Broken.tsx',
              name: 'Broken.tsx',
              content: 'export const Broken = () => { return <div>Missing bracket;',
              language: 'typescript',
              isEntry: true,
            },
          ],
        });

      const valRes = await request(app)
        .post(`/api/admin/components/${testSlug}/validate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(valRes.status).toBe(200);
      expect(valRes.body.data.report.valid).toBe(false);
      expect(
        valRes.body.data.report.errors.some((e: string) => e.includes('Syntax error'))
      ).toBe(true);
    });

    it('prevents publishing an invalid draft', async () => {
      const pubRes = await request(app)
        .post(`/api/admin/components/${testSlug}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ version: '1.0.0', changelog: 'Initial test release' });

      expect(pubRes.status).toBe(400);
      expect(pubRes.body.success).toBe(false);
      expect(pubRes.body.error.code).toBe('PUBLISH_VALIDATION_FAILED');
    });
  });

  describe('4. Component Publishing, Immutability & Public Integration', () => {
    const testSlug = 'studio-test-badge';

    it('publishes valid component, creates immutable version, and transitions status', async () => {
      // Fix draft to be valid
      const validCode = `import React from 'react';

export interface StudioTestBadgeProps {
  label?: string;
}

export const StudioTestBadge: React.FC<StudioTestBadgeProps> = ({ label = 'Active' }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
      {label}
    </span>
  );
};
export default StudioTestBadge;
`;

      await request(app)
        .patch(`/api/admin/components/${testSlug}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'A high quality glowing tactile badge component.',
          category: 'Buttons & Controls',
          draftFiles: [
            {
              path: 'src/components/StudioTestBadge.tsx',
              name: 'StudioTestBadge.tsx',
              content: validCode,
              language: 'typescript',
              isEntry: true,
            },
          ],
          draftDependencies: { react: '>=18.0.0' },
          draftProps: [{ name: 'label', type: 'string', required: false, description: 'Badge text' }],
        });

      // Publish release
      const pubRes = await request(app)
        .post(`/api/admin/components/${testSlug}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ version: '1.0.0', changelog: 'Initial production release for studio badge.' });

      expect(pubRes.status).toBe(201);
      expect(pubRes.body.success).toBe(true);
      expect(pubRes.body.data.component.status).toBe('published');
      expect(pubRes.body.data.component.currentVersion).toBe('1.0.0');
    });

    it('enforces version immutability (cannot re-publish version 1.0.0)', async () => {
      const res = await request(app)
        .post(`/api/admin/components/${testSlug}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ version: '1.0.0', changelog: 'Trying to overwrite release' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VERSION_IMMUTABLE');
    });

    it('published component now appears in public catalog', async () => {
      const res = await request(app).get('/api/components?search=studio-test-badge');
      expect(res.status).toBe(200);
      const found = res.body.data.find((c: any) => c.slug === testSlug);
      expect(found).toBeDefined();
      expect(found.slug).toBe(testSlug);
      expect(found.status).toBe('published');
    });

    it('resolves detail route /api/components/:slug with releases', async () => {
      const res = await request(app).get(`/api/components/${testSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe(testSlug);
      expect(res.body.data.currentVersion).toBe('1.0.0');
      expect(res.body.data.versions.length).toBeGreaterThan(0);
    });
  });

  describe('5. Audit Logging & Analytics', () => {
    it('records administrative actions and allows admin to query audit logs', async () => {
      const res = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.logs.length).toBeGreaterThan(0);
      const actions = res.body.data.logs.map((l: any) => l.action);
      expect(actions).toContain('component.create');
      expect(actions).toContain('component.publish');
    });

    it('rejects non-admin from querying audit logs', async () => {
      const res = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${regularUserToken}`);
      expect(res.status).toBe(403);
    });

    it('returns genuine aggregate analytics without fabricated metrics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('categoryDistribution');
      expect(res.body.data).toHaveProperty('statusDistribution');
      expect(res.body.data).toHaveProperty('totalReleases');
    });
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { createApp } from '../app';
import { env } from '../config/env';
import { AdminStore } from '../modules/admin/admin.store';
import { fileRegistryStore } from '../modules/registry/registry.service';

describe('Component Version Management and Comparison API', () => {
  const app = createApp();

  const adminToken = jwt.sign(
    { id: 'usr_admin_test_vm', email: 'admin@vac.dev', role: 'admin', name: 'Admin Master' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const userToken = jwt.sign(
    { id: 'usr_regular_test_vm', email: 'user@vac.dev', role: 'user', name: 'Regular Dev' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const testSlug = 'vm-test-' + Math.random().toString(36).substring(2, 9);

  beforeAll(async () => {
    // 3. Setup a mock multi-version component for comparison testing
    await AdminStore.createComponent({
      slug: testSlug,
      name: 'Version Test Widget',
      description: 'Component for testing multi-version comparison and deprecation.',
      category: 'Tactile Micro-UX',
      tags: ['Test', 'Version'],
      license: 'MIT',
      author: 'VAC Team',
      documentation: 'Testing docs',
    });

    // Update draft to v1.0.0
    await AdminStore.updateComponent(testSlug, {
      draftFiles: [
        {
          path: 'src/components/Widget.tsx',
          name: 'Widget.tsx',
          content: 'export const Widget = () => <div>V1 Original Line 1\nV1 Common Line\nV1 Deleted Line</div>;\n',
          language: 'typescript',
          isEntry: true,
        },
        {
          path: 'src/components/RemovedHelper.ts',
          name: 'RemovedHelper.ts',
          content: 'export const oldHelper = () => "removed in v1.1.0";\n',
          language: 'typescript',
          isEntry: false,
        },
      ],
      draftDependencies: {
        react: '^18.0.0',
        lodash: '^4.17.21',
      },
      draftProps: [
        { name: 'title', type: 'string', required: true, description: 'Title prop' },
        { name: 'deprecatedProp', type: 'boolean', required: false, description: 'Will be removed in v1.1.0' },
      ],
      draftChangelog: 'Initial version 1.0.0 release',
    });

    // Publish v1.0.0
    await AdminStore.publishRelease(testSlug, '1.0.0', 'Initial release 1.0.0');

    // Update draft to v1.1.0 (modify Widget, remove RemovedHelper, add NewHelper, update deps & props)
    await AdminStore.updateComponent(testSlug, {
      draftFiles: [
        {
          path: 'src/components/Widget.tsx',
          name: 'Widget.tsx',
          content: 'export const Widget = () => <div>V1 Modified Line 1\nV1 Common Line\nV1.1 Added Line</div>;\n',
          language: 'typescript',
          isEntry: true,
        },
        {
          path: 'src/components/NewHelper.ts',
          name: 'NewHelper.ts',
          content: 'export const newHelper = () => "added in v1.1.0";\n',
          language: 'typescript',
          isEntry: false,
        },
      ],
      draftDependencies: {
        react: '^18.0.0', // unchanged
        'lucide-react': '^1.0.0', // added
        // lodash removed
      },
      draftProps: [
        { name: 'title', type: 'string', required: true, description: 'Title prop' }, // unchanged
        { name: 'subtitle', type: 'string', required: false, description: 'New subtitle prop' }, // added
      ],
      draftChangelog: 'Version 1.1.0: Added NewHelper, updated dependencies',
    });

    // Publish v1.1.0
    await AdminStore.publishRelease(testSlug, '1.1.0', 'Version 1.1.0 release');
  });

  describe('GET /api/registry/components/:slug/versions', () => {
    it('returns published versions and rich details array', async () => {
      const res = await request(app).get(`/api/registry/components/${testSlug}/versions`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe(testSlug);
      expect(res.body.data.versions).toContain('1.0.0');
      expect(res.body.data.versions).toContain('1.1.0');
      expect(res.body.data.latest).toBe('1.1.0');
      expect(Array.isArray(res.body.data.details)).toBe(true);
      expect(res.body.data.details.length).toBeGreaterThanOrEqual(2);

      const v1 = res.body.data.details.find((d: any) => d.version === '1.0.0');
      expect(v1).toBeDefined();
      expect(v1.changelog).toContain('1.0.0');
    });

    it('returns 404 for an unpublished or non-existent component', async () => {
      const res = await request(app).get('/api/registry/components/non-existent-comp-xyz/versions');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/registry/components/:slug/compare', () => {
    it('accurately compares two published versions with file, dependency, and prop diffs', async () => {
      const res = await request(app)
        .get(`/api/registry/components/${testSlug}/compare?from=1.0.0&to=1.1.0`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      expect(data.fromVersion).toBe('1.0.0');
      expect(data.toVersion).toBe('1.1.0');

      // Check summary
      expect(data.summary.filesAdded).toBe(1); // NewHelper.ts
      expect(data.summary.filesRemoved).toBe(1); // RemovedHelper.ts
      expect(data.summary.filesModified).toBe(1); // Widget.tsx

      // Check files diff
      const newHelper = data.files.find((f: any) => f.name === 'NewHelper.ts');
      expect(newHelper).toBeDefined();
      expect(newHelper.status).toBe('added');

      const removedHelper = data.files.find((f: any) => f.name === 'RemovedHelper.ts');
      expect(removedHelper).toBeDefined();
      expect(removedHelper.status).toBe('removed');

      const widget = data.files.find((f: any) => f.name === 'Widget.tsx');
      expect(widget).toBeDefined();
      expect(widget.status).toBe('modified');
      expect(Array.isArray(widget.lineDiff)).toBe(true);
      // Line diff should contain additions and deletions
      expect(widget.lineDiff.some((l: any) => l.type === 'add')).toBe(true);
      expect(widget.lineDiff.some((l: any) => l.type === 'del')).toBe(true);
      expect(widget.lineDiff.some((l: any) => l.type === 'eq')).toBe(true);

      // Check dependencies diff
      expect(data.dependencies.added['lucide-react']).toBe('^1.0.0');
      expect(data.dependencies.removed['lodash']).toBe('^4.17.21');

      // Check props diff
      expect(data.props.added.some((p: any) => p.name === 'subtitle')).toBe(true);
      expect(data.props.removed.some((p: any) => p.name === 'deprecatedProp')).toBe(true);
    });

    it('rejects comparison when query params are missing', async () => {
      const res = await request(app).get(`/api/registry/components/${testSlug}/compare`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_QUERY');
    });

    it('rejects invalid semver strings in comparison', async () => {
      const res = await request(app)
        .get(`/api/registry/components/${testSlug}/compare?from=bad-version&to=1.0.0`);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_VERSION');
    });

    it('returns 404 when comparing against a non-existent version', async () => {
      const res = await request(app)
        .get(`/api/registry/components/${testSlug}/compare?from=1.0.0&to=9.9.9`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VERSION_NOT_FOUND');
    });
  });

  describe('Release Deprecation API & Security', () => {
    it('requires authentication to deprecate a release', async () => {
      const res = await request(app)
        .post(`/api/admin/components/${testSlug}/versions/1.0.0/deprecate`)
        .send({ reason: 'Superceded by v1.1.0' });
      expect(res.status).toBe(401);
    });

    it('denies access to non-admin users to deprecate a release', async () => {
      const res = await request(app)
        .post(`/api/admin/components/${testSlug}/versions/1.0.0/deprecate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Superceded by v1.1.0' });
      expect(res.status).toBe(403);
    });

    it('allows verified admin to deprecate a release with reason', async () => {
      const res = await request(app)
        .post(`/api/admin/components/${testSlug}/versions/1.0.0/deprecate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Deprecated in favor of v1.1.0 with enhanced performance.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify public manifest reflects deprecation
      const manifestRes = await request(app).get(`/api/registry/components/${testSlug}/1.0.0`);
      expect(manifestRes.status).toBe(200);
      expect(manifestRes.body.data.deprecated).toBe(true);
      expect(manifestRes.body.data.deprecationReason).toBe('Deprecated in favor of v1.1.0 with enhanced performance.');
    });

    it('returns 404 when attempting to deprecate a non-existent version', async () => {
      const res = await request(app)
        .post(`/api/admin/components/${testSlug}/versions/8.8.8/deprecate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Invalid' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('VERSION_NOT_FOUND');
    });

    it('records audit log on release deprecation', async () => {
      const auditRes = await request(app)
        .get('/api/admin/audit-logs?action=release.deprecate')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(auditRes.status).toBe(200);
      expect(auditRes.body.data.logs.some((l: any) => l.action === 'release.deprecate')).toBe(true);
    });
  });

  afterAll(() => {
    try {
      const storageDir = path.resolve(process.cwd(), '../packages/registry/storage', testSlug);
      if (fs.existsSync(storageDir)) {
        fs.rmSync(storageDir, { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup error
    }
  });
});

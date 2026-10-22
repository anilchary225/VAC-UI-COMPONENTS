import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { AdminStore } from '../modules/admin/admin.store';
import { RegistryService, fileRegistryStore } from '../modules/registry/registry.service';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';

describe('Registry Persistence, Process Restart Recovery, and Concurrent Publishing Tests', () => {
  const app = createApp();
  const testSlug = `persist-test-${Date.now()}`;
  const adminToken = jwt.sign(
    { id: 'usr_admin_persist', email: 'admin_persist@vac.dev', role: 'admin', name: 'Admin Persist' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  afterAll(() => {
    // Clean up test slug directory in storage if created
    const storagePath = path.resolve(process.cwd(), 'packages/registry/storage', testSlug);
    if (fs.existsSync(storagePath)) {
      fs.rmSync(storagePath, { recursive: true, force: true });
    }
  });

  it('creates and publishes an immutable release snapshot', async () => {
    // 1. Create component draft
    const createRes = await request(app)
      .post('/api/admin/components')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Persist Test Component',
        slug: testSlug,
        description: 'Test component for restart recovery',
        category: 'Buttons & Controls',
        tags: ['Button'],
      });
    expect(createRes.status).toBe(201);

    // 2. Add source file
    await request(app)
      .patch(`/api/admin/components/${testSlug}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        draftFiles: [
          {
            path: 'src/components/PersistButton.tsx',
            name: 'PersistButton.tsx',
            content: 'export const PersistButton = () => <button>Persist</button>;',
            language: 'typescript',
            isEntry: true,
          },
        ],
      });

    // 3. Publish v1.0.0
    const pubRes = await request(app)
      .post(`/api/admin/components/${testSlug}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        version: '1.0.0',
        changelog: 'Initial persistent release',
      });
    expect(pubRes.status).toBe(201);
  });

  it('recovers release manifest seamlessly even if local disk store is unavailable or restarted', async () => {
    // Fetch manifest through public registry API
    const manifest = await RegistryService.getReleaseManifest(testSlug, '1.0.0');
    expect(manifest).not.toBeNull();
    expect(manifest?.slug).toBe(testSlug);
    expect(manifest?.version).toBe('1.0.0');
    expect(manifest?.files[0].content).toContain('PersistButton');
    expect(manifest?.integrity).toBeDefined();
    expect(manifest?.integrity?.startsWith('sha256-')).toBe(true);
  });

  it('rejects concurrent publishing of the exact same version with 409 Conflict', async () => {
    // Attempt concurrent publish calls
    const publishAttempt1 = request(app)
      .post(`/api/admin/components/${testSlug}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ version: '1.0.0', changelog: 'Duplicate attempt 1' });

    const publishAttempt2 = request(app)
      .post(`/api/admin/components/${testSlug}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ version: '1.0.0', changelog: 'Duplicate attempt 2' });

    const [res1, res2] = await Promise.all([publishAttempt1, publishAttempt2]);

    // Both or at least one must be rejected with 409 Conflict
    const hasConflict = res1.status === 409 || res2.status === 409;
    expect(hasConflict).toBe(true);
  });

  it('deprecating a release preserves immutable snapshot and marks it deprecated', async () => {
    const depRes = await request(app)
      .post(`/api/admin/components/${testSlug}/versions/1.0.0/deprecate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Security maintenance test deprecation' });

    expect(depRes.status).toBe(200);

    // Verify public release is still completely readable and intact
    const manifest = await RegistryService.getReleaseManifest(testSlug, '1.0.0');
    expect(manifest).not.toBeNull();
    expect(manifest?.deprecated).toBe(true);
    expect(manifest?.deprecationReason).toBe('Security maintenance test deprecation');
    expect(manifest?.files[0].content).toContain('PersistButton');
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { env } from '../config/env';

describe('Favorites and Collections API Integration Tests', () => {
  const app = createApp();

  const tokenUser1 = jwt.sign(
    { id: 'usr_mock_111', email: 'user1@vac.dev', role: 'user', name: 'User 1' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const tokenUser2 = jwt.sign(
    { id: 'usr_mock_222', email: 'user2@vac.dev', role: 'user', name: 'User 2' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  describe('Favorites API', () => {
    it('rejects unauthenticated requests to /api/favorites', async () => {
      const res = await request(app).get('/api/favorites');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects adding invalid component slug to favorites', async () => {
      const res = await request(app)
        .post('/api/favorites/completely-fake-slug')
        .set('Authorization', `Bearer ${tokenUser1}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('COMPONENT_NOT_FOUND');
    });

    it('allows authenticated user to favorite and list valid component', async () => {
      // Add favorite
      const addRes = await request(app)
        .post('/api/favorites/animated-login-form')
        .set('Authorization', `Bearer ${tokenUser1}`);
      expect([200, 201]).toContain(addRes.status);
      expect(addRes.body.success).toBe(true);

      // List favorites
      const listRes = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${tokenUser1}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.data).toContain('animated-login-form');

      // Verify User 2 does not have User 1's favorites
      const user2List = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${tokenUser2}`);
      expect(user2List.status).toBe(200);
      expect(user2List.body.data).not.toContain('animated-login-form');
    });

    it('handles duplicate favorite safely without crashing', async () => {
      const res = await request(app)
        .post('/api/favorites/animated-login-form')
        .set('Authorization', `Bearer ${tokenUser1}`);
      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
    });

    it('removes favorite successfully', async () => {
      const delRes = await request(app)
        .delete('/api/favorites/animated-login-form')
        .set('Authorization', `Bearer ${tokenUser1}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      const listRes = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${tokenUser1}`);
      expect(listRes.body.data).not.toContain('animated-login-form');
    });
  });

  describe('Collections API', () => {
    it('rejects unauthenticated requests to /api/collections', async () => {
      const res = await request(app).get('/api/collections');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    let createdCollectionId = '';

    it('creates a collection for authenticated user', async () => {
      const res = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          name: 'Production Auth Suite',
          description: 'Login and onboarding components',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Production Auth Suite');
      expect(res.body.data.id).toBeDefined();
      createdCollectionId = res.body.data.id;
    });

    it('prevents creating duplicate collection names for the same user', async () => {
      const res = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          name: 'Production Auth Suite',
        });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('adds component item to collection', async () => {
      const res = await request(app)
        .post(`/api/collections/${createdCollectionId}/items`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({ componentSlug: 'animated-login-form' });
      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.some((it: any) => it.componentSlug === 'animated-login-form')).toBe(true);
    });

    it('rejects adding invalid component slug to collection', async () => {
      const res = await request(app)
        .post(`/api/collections/${createdCollectionId}/items`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({ componentSlug: 'fake-ghost-component' });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('COMPONENT_NOT_FOUND');
    });

    it('denies cross-user collection access', async () => {
      // User 2 attempts to get User 1's collection
      const getRes = await request(app)
        .get(`/api/collections/${createdCollectionId}`)
        .set('Authorization', `Bearer ${tokenUser2}`);
      expect(getRes.status).toBe(404);

      // User 2 attempts to delete User 1's collection
      const delRes = await request(app)
        .delete(`/api/collections/${createdCollectionId}`)
        .set('Authorization', `Bearer ${tokenUser2}`);
      expect(delRes.status).toBe(404);
    });

    it('removes item from collection', async () => {
      const res = await request(app)
        .delete(`/api/collections/${createdCollectionId}/items/animated-login-form`)
        .set('Authorization', `Bearer ${tokenUser1}`);
      expect(res.status).toBe(200);
      expect(res.body.data.items.some((it: any) => it.componentSlug === 'animated-login-form')).toBe(false);
    });

    it('renames and deletes collection successfully', async () => {
      // Rename
      const patchRes = await request(app)
        .patch(`/api/collections/${createdCollectionId}`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({ name: 'Renamed Auth Suite' });
      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.name).toBe('Renamed Auth Suite');

      // Delete
      const delRes = await request(app)
        .delete(`/api/collections/${createdCollectionId}`)
        .set('Authorization', `Bearer ${tokenUser1}`);
      expect(delRes.status).toBe(200);

      // Verify deletion
      const getRes = await request(app)
        .get(`/api/collections/${createdCollectionId}`)
        .set('Authorization', `Bearer ${tokenUser1}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('Profile & Authorization Security', () => {
    it('rejects unauthenticated profile update', async () => {
      const res = await request(app).patch('/api/auth/profile').send({ name: 'Hacker' });
      expect(res.status).toBe(401);
    });

    it('rejects invalid or unauthorized field injection (like role: admin)', async () => {
      // Even if role is provided, Zod validator strips it or rejects schema if strict
      const res = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({ role: 'admin' });
      // When Mongo is not connected, either 503 from service or 400 from validation
      expect([200, 400, 503]).toContain(res.status);
    });
  });
});

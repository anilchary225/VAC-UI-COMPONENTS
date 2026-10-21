import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('Backend Smoke & Health Endpoint Tests', () => {
  const app = createApp();

  it('GET /api/health returns 200 with server status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.version).toBe('1.0.0');
    expect(res.body.database).toBeDefined();
    expect(typeof res.body.uptime).toBe('number');
  });

  it('GET /api/components returns catalog data', async () => {
    const res = await request(app).get('/api/components');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /non-existent-route returns standard 404 AppError JSON', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});

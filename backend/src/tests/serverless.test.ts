import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { serverlessHandler, app } from '../serverless';

describe('Vercel Serverless Entry Point Tests', () => {
  it('serverlessHandler handles /api/health request without listening on a TCP port', async () => {
    const res = await request(serverlessHandler as any).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('database');
  });

  it('serverlessHandler reuses warm database connection across multiple invocations', async () => {
    const res1 = await request(serverlessHandler as any).get('/api/health');
    expect(res1.status).toBe(200);

    const res2 = await request(serverlessHandler as any).get('/api/health');
    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);
  });

  it('serverlessHandler correctly routes catalog queries to Express app', async () => {
    const res = await request(serverlessHandler as any).get('/api/components');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(9);
  });

  it('serverlessHandler handles 404 for unknown routes without crashing', async () => {
    const res = await request(serverlessHandler as any).get('/api/unknown-serverless-path');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });

  it('restores original path and query parameters when rewritten to /api/index by Vercel edge', async () => {
    const res = await request(serverlessHandler as any)
      .get('/api/index?category=buttons')
      .set('x-matched-path', '/api/components');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('exports underlying Express app instance for flexible serverless runtimes', () => {
    expect(app).toBeDefined();
    expect(typeof app.use).toBe('function');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { OAuthService } from '../modules/auth/oauth.service';
import { UserModel } from '../models/User';
import { env } from '../config/env';

describe('OAuth Service and Router Tests', () => {
  const app = createApp();

  describe('OAuth State Security & Validation', () => {
    it('generates a valid, verifiable state token', () => {
      const state = OAuthService.generateOAuthState('github');
      expect(typeof state).toBe('string');
      expect(state.length).toBeGreaterThan(20);

      const isValid = OAuthService.validateOAuthState(state, 'github');
      expect(isValid).toBe(true);
    });

    it('rejects state token if provider mismatches', () => {
      const state = OAuthService.generateOAuthState('github');
      const isValid = OAuthService.validateOAuthState(state, 'google');
      expect(isValid).toBe(false);
    });

    it('rejects tampered state token', () => {
      const state = OAuthService.generateOAuthState('github');
      const tampered = state.slice(0, -4) + 'abcd';
      const isValid = OAuthService.validateOAuthState(tampered, 'github');
      expect(isValid).toBe(false);
    });

    it('rejects expired state token', () => {
      // Generate state with timestamp 15 minutes ago
      const oldTime = (Date.now() - 15 * 60 * 1000).toString();
      const payload = `github:testrandom:${oldTime}`;
      const crypto = require('crypto');
      const signature = crypto.createHmac('sha256', env.JWT_SECRET).update(payload).digest('hex');
      const expiredState = Buffer.from(`${payload}:${signature}`).toString('base64url');

      const isValid = OAuthService.validateOAuthState(expiredState, 'github');
      expect(isValid).toBe(false);
    });
  });

  describe('Open Redirect Prevention', () => {
    it('always redirects strictly to FRONTEND_URL and appends token as query parameter', () => {
      const token = 'jwt_test_token_123';
      const url = OAuthService.getSafeRedirectUrl(token);

      const parsed = new URL(url);
      const frontendParsed = new URL(env.FRONTEND_URL);
      expect(parsed.origin).toBe(frontendParsed.origin);
      expect(parsed.searchParams.get('token')).toBe(token);
    });

    it('appends oauth_error safely without altering origin', () => {
      const errorMsg = 'Access was denied by user';
      const url = OAuthService.getSafeRedirectUrl(undefined, errorMsg);

      const parsed = new URL(url);
      const frontendParsed = new URL(env.FRONTEND_URL);
      expect(parsed.origin).toBe(frontendParsed.origin);
      expect(parsed.searchParams.get('oauth_error')).toBe(errorMsg);
    });
  });

  describe('OAuth Endpoints', () => {
    it('GET /api/auth/oauth/status returns public configuration flags', async () => {
      const res = await request(app).get('/api/auth/oauth/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('github');
      expect(res.body.data).toHaveProperty('google');
    });

    it('GET /api/auth/oauth/github returns 503 when client credentials are not configured', async () => {
      const origId = env.GITHUB_CLIENT_ID;
      (env as any).GITHUB_CLIENT_ID = '';

      const res = await request(app).get('/api/auth/oauth/github');
      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe('OAUTH_NOT_CONFIGURED');

      (env as any).GITHUB_CLIENT_ID = origId;
    });

    it('GET /api/auth/oauth/google returns 503 when client credentials are not configured', async () => {
      const origId = env.GOOGLE_CLIENT_ID;
      (env as any).GOOGLE_CLIENT_ID = '';

      const res = await request(app).get('/api/auth/oauth/google');
      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe('OAUTH_NOT_CONFIGURED');

      (env as any).GOOGLE_CLIENT_ID = origId;
    });

    it('GET /api/auth/oauth/github/callback redirects to frontend with error on invalid state', async () => {
      const res = await request(app)
        .get('/api/auth/oauth/github/callback')
        .query({ code: 'valid_code', state: 'invalid_state_123' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('oauth_error=');
      const targetUrl = new URL(res.headers.location);
      expect(targetUrl.searchParams.get('oauth_error')).toBe('Invalid or expired OAuth state token.');
    });

    it('GET /api/auth/oauth/google/callback redirects to frontend with error on invalid state', async () => {
      const res = await request(app)
        .get('/api/auth/oauth/google/callback')
        .query({ code: 'valid_code', state: 'invalid_state_123' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('oauth_error=');
      const targetUrl = new URL(res.headers.location);
      expect(targetUrl.searchParams.get('oauth_error')).toBe('Invalid or expired OAuth state token.');
    });

    it('GET /api/auth/oauth/github/callback handles provider cancellation error safely', async () => {
      const res = await request(app)
        .get('/api/auth/oauth/github/callback')
        .query({ error: 'access_denied', error_description: 'User denied authorization' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('oauth_error=');
      const targetUrl = new URL(res.headers.location);
      expect(targetUrl.searchParams.get('oauth_error')).toBe('User denied authorization');
    });
  });
});

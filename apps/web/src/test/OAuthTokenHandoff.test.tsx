import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../features/auth/authStore';
import { api } from '../lib/api';

const ConsumerComponent: React.FC = () => {
  const { user, isLoading } = useAuth();
  return (
    <div>
      <span data-testid="auth-loading">{isLoading ? 'loading' : 'ready'}</span>
      <span data-testid="user-name">{user ? user.name : 'anonymous'}</span>
    </div>
  );
};

describe('OAuth Secure Fragment Token Handoff Tests', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
    api.setToken(null);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    api.setToken(null);
    window.location.hash = '';
    window.location.search = '';
  });

  it('extracts token from URL fragment (#token=...), sets api token, and cleans URL', async () => {
    const testToken = 'secure_test_jwt_fragment_token';
    window.location.hash = `#token=${testToken}`;
    window.location.search = '';

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const setTokenSpy = vi.spyOn(api, 'setToken');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValueOnce({
      id: 'usr-1',
      name: 'OAuth User',
      email: 'oauth@example.com',
      role: 'user',
      createdAt: new Date().toISOString(),
    });

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    expect(setTokenSpy).toHaveBeenCalledWith(testToken);
    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      document.title,
      window.location.pathname
    );

    await waitFor(() => {
      expect(api.getToken()).toBe(testToken);
    });
  });

  it('handles missing token and empty fragment gracefully without errors', async () => {
    window.location.hash = '';
    window.location.search = '';

    const setTokenSpy = vi.spyOn(api, 'setToken');

    const { getByTestId } = render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    expect(setTokenSpy).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(getByTestId('auth-loading').textContent).toBe('ready');
      expect(getByTestId('user-name').textContent).toBe('anonymous');
    });
  });

  it('handles error in fragment and sanitizes URL without storing invalid tokens', async () => {
    window.location.hash = '#oauth_error=User%20denied%20authorization';
    window.location.search = '';

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const setTokenSpy = vi.spyOn(api, 'setToken');

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    expect(setTokenSpy).not.toHaveBeenCalled();
    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      document.title,
      window.location.pathname
    );
  });

  it('fallback supports query parameter token and sanitizes search parameters', async () => {
    const testQueryToken = 'legacy_query_jwt_token';
    window.location.hash = '';
    // Mock URL with query parameter
    delete (window as any).location;
    window.location = new URL(`http://localhost:5173/dashboard?token=${testQueryToken}`) as any;

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const setTokenSpy = vi.spyOn(api, 'setToken');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValueOnce({
      id: 'usr-2',
      name: 'Query User',
      email: 'query@example.com',
      role: 'user',
      createdAt: new Date().toISOString(),
    });

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    expect(setTokenSpy).toHaveBeenCalledWith(testQueryToken);
    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      document.title,
      '/dashboard'
    );
  });
});

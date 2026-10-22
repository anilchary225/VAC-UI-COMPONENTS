import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth/authStore';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { ComponentStudio } from '../features/admin/ComponentStudio';
import { StudioDraftPreview } from '../features/admin/StudioDraftPreview';
import { api } from '../lib/api';

describe('Phase 3 Admin Dashboard and Component Studio Frontend Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <AuthProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthProvider>
    );
  };

  it('displays administrator access required barrier when unauthenticated', () => {
    renderWithProviders(<AdminDashboardPage />);
    expect(screen.getByText('Administrator Access Required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In as Demo Admin/i })).toBeInTheDocument();
  });

  it('renders ComponentStudio in create mode with metadata and file tabs', () => {
    render(
      <MemoryRouter>
        <ComponentStudio componentId={null} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('Metadata')).toBeInTheDocument();
    expect(screen.getByText('Source Files (1)')).toBeInTheDocument();
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    expect(screen.getByText('Validation & Release')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Draft/i })).toBeInTheDocument();
  });

  it('switches to source files tab and shows code editor in ComponentStudio', () => {
    render(
      <MemoryRouter>
        <ComponentStudio componentId={null} onClose={() => {}} />
      </MemoryRouter>
    );

    const filesTab = screen.getByRole('button', { name: /Source Files/i });
    fireEvent.click(filesTab);

    expect(screen.getByText('Component.tsx')).toBeInTheDocument();
    expect(screen.getByText(/Syntax: typescript/i)).toBeInTheDocument();
  });

  it('renders StudioDraftPreview with Viewport switchers and theme canvas', () => {
    render(
      <StudioDraftPreview
        slug="test-preview-comp"
        name="Test Preview Component"
        description="A draft component description"
        files={[
          {
            path: 'src/components/TestComp.tsx',
            name: 'TestComp.tsx',
            content: 'export const TestComp = () => <div>Hello</div>;',
            language: 'typescript',
            isEntry: true,
          },
        ]}
      />
    );

    expect(screen.getByRole('button', { name: /Desktop/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tablet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mobile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset State/i })).toBeInTheDocument();
    expect(screen.getByText('Test Preview Component')).toBeInTheDocument();
  });

  it('renders AdminConfigure component with system diagnostics', async () => {
    vi.spyOn(api, 'getAdminConfig').mockResolvedValueOnce({
      version: '1.0.0',
      nodeEnv: 'development',
      port: 4000,
      frontendUrl: 'http://localhost:5173',
      database: { status: 'connected', type: 'MongoDB Atlas', activePool: true },
      registryStorage: { driver: 'local', s3Configured: false, s3Bucket: null, s3Region: 'us-east-1' },
      oauth: { github: true, google: true },
      security: { jwtExpiresIn: '7d', bootstrapOpen: false },
      stats: { adminCount: 1, totalUsers: 3, totalComponents: 9, publishedCount: 9 },
    });

    const { AdminConfigure } = await import('../features/admin/AdminConfigure');
    render(<AdminConfigure />);

    await waitFor(() => {
      expect(screen.getByText('System & Platform Configuration')).toBeInTheDocument();
      expect(screen.getByText('Database Cluster')).toBeInTheDocument();
      expect(screen.getByText('Registry Storage')).toBeInTheDocument();
      expect(screen.getByText('OAuth 2.0 Social Login Providers')).toBeInTheDocument();
    });
  });

  it('renders AdminRegistryReleases component with release list and empty state', async () => {
    vi.spyOn(api, 'getAdminRegistry').mockResolvedValueOnce([
      {
        componentSlug: 'interactive-counter',
        version: '1.0.0',
        publishedAt: new Date().toISOString(),
        manifestHash: 'a1b2c3d4e5f6',
        deprecated: false,
      },
    ]);

    const { AdminRegistryReleases } = await import('../features/admin/AdminRegistryReleases');
    const { unmount } = render(<AdminRegistryReleases />);

    await waitFor(() => {
      expect(screen.getByText('interactive-counter')).toBeInTheDocument();
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });

    unmount();

    // Test empty state
    vi.spyOn(api, 'getAdminRegistry').mockResolvedValueOnce([]);
    render(<AdminRegistryReleases />);
    await waitFor(() => {
      expect(screen.getByText(/No releases published to the registry yet/i)).toBeInTheDocument();
    });
  });

  it('renders AdminUsers component with user directory and empty state', async () => {
    vi.spyOn(api, 'getAdminUsers').mockResolvedValueOnce([
      {
        id: 'usr-1',
        name: 'Lead Developer',
        email: 'lead@vac.dev',
        role: 'admin',
        hasGithub: true,
        hasGoogle: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    const { AdminUsers } = await import('../features/admin/AdminUsers');
    const { unmount } = render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText('Lead Developer')).toBeInTheDocument();
      expect(screen.getByText('lead@vac.dev')).toBeInTheDocument();
    });

    unmount();

    // Test empty state
    vi.spyOn(api, 'getAdminUsers').mockResolvedValueOnce([]);
    render(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText(/No registered users found/i)).toBeInTheDocument();
    });
  });
});

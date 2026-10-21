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
});

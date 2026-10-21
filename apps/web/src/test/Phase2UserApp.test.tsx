import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth/authStore';
import { ComponentsCatalogPage } from '../pages/ComponentsCatalogPage';
import { ComponentLivePreview } from '../components/previews/ComponentLivePreview';

describe('Phase 2 User Application Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <AuthProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthProvider>
    );
  };

  it('renders all nine official components in the catalog', () => {
    renderWithProviders(<ComponentsCatalogPage />);

    const nineComponentTitles = [
      'Animated Login Form',
      'Glassmorphism Navbar',
      'Interactive Pricing Tier',
      'Analytics Metrics Matrix',
      'Notification Center Feed',
      'Drag & Drop File Upload',
      'Glass Pill Button',
      'Animated Toggle Switch',
      'Spotlight Ambient Card',
    ];

    nineComponentTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it('filters components dynamically when clicking category buttons', () => {
    renderWithProviders(<ComponentsCatalogPage />);

    // Click "Action Triggers" category
    const actionBtn = screen.getByRole('button', { name: /Action Triggers/i });
    fireEvent.click(actionBtn);

    // Only Action Triggers (Glass Pill Button, Animated Toggle Switch) should be visible
    expect(screen.getByText('Glass Pill Button')).toBeInTheDocument();
    expect(screen.getByText('Animated Toggle Switch')).toBeInTheDocument();

    // Click "All Elements" to reset
    const allBtn = screen.getByRole('button', { name: /All Elements/i });
    fireEvent.click(allBtn);
    expect(screen.getByText('Animated Login Form')).toBeInTheDocument();
  });

  it('renders live interactive preview and viewport switchers for animated-login-form', () => {
    render(<ComponentLivePreview slug="animated-login-form" />);

    // Check viewport buttons
    expect(screen.getByTitle(/Desktop viewport/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Tablet viewport/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Mobile viewport/i)).toBeInTheDocument();

    // Check rendered form elements
    expect(screen.getByPlaceholderText('dev@vac.design')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders live interactive preview for toggle-switch', () => {
    render(<ComponentLivePreview slug="toggle-switch" />);
    expect(screen.getByText(/Live Preview State/i)).toBeInTheDocument();
    expect(screen.getByText(/ACTIVE/i)).toBeInTheDocument();
  });
});

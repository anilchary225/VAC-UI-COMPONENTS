import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { App } from '../app/App';

describe('Web Application Shell Smoke Tests', () => {
  it('renders application brand in the sidebar', () => {
    render(<App />);
    expect(screen.getByText('VAC')).toBeInTheDocument();
    expect(screen.getByText('.UI')).toBeInTheDocument();
  });

  it('renders primary navigation items', () => {
    render(<App />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Collections')).toBeInTheDocument();
  });

  it('renders quick install command in the overview', () => {
    render(<App />);
    expect(screen.getByText(/npx vac-ui-components add animated-login-form/i)).toBeInTheDocument();
  });
});

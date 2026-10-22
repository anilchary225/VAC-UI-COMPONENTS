import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ComponentInspectorModal } from '../components/ComponentInspectorModal';
import { api } from '../lib/api';

describe('Phase 5 Component Version Management & Comparison Frontend Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, 'getRegistryManifest').mockResolvedValue({
      schemaVersion: '1.0.0',
      name: 'Animated Glass Login Form',
      slug: 'animated-login-form',
      version: '1.1.0',
      description: 'Smooth glassmorphic login interface.',
      category: 'Auth & Form Fields',
      files: [{ path: 'LoginForm.tsx', name: 'LoginForm.tsx', content: 'export const LoginForm = () => <form />;', language: 'typescript', isEntry: true }],
      dependencies: { react: '^18.0.0' },
      devDependencies: {},
      peerDependencies: {},
      props: [{ name: 'onSubmit', type: 'function', description: 'Callback function' }],
      styling: { framework: 'tailwind' },
      license: 'MIT',
      author: 'VAC Team',
      publishedAt: new Date().toISOString(),
      deprecated: false,
    });
  });

  const mockComponent = {
    slug: 'animated-login-form',
    title: 'Animated Glass Login Form',
    description: 'Smooth glassmorphic login interface.',
    category: 'Auth & Form Fields',
    subcategory: 'Authentication',
    cliCommand: 'npx vac-ui-components add animated-login-form',
    props: [
      { name: 'onSubmit', type: 'function', description: 'Callback function' },
    ],
    codeSnippet: 'export const LoginForm = () => <form />;',
  };

  it('renders ComponentInspectorModal with version tabs and default version chip', async () => {
    vi.spyOn(api, 'getRegistryVersions').mockResolvedValue({
      slug: 'animated-login-form',
      versions: ['1.1.0', '1.0.0'],
      latest: '1.1.0',
      details: [
        { version: '1.1.0', publishedAt: new Date().toISOString(), changelog: 'Version 1.1.0' },
        { version: '1.0.0', publishedAt: new Date().toISOString(), changelog: 'Version 1.0.0' },
      ],
    });

    render(
      <ComponentInspectorModal
        component={mockComponent}
        onClose={() => {}}
        isFavorite={() => false}
        toggleFavorite={() => {}}
        collections={[]}
        addComponentToCollection={async () => {}}
      />
    );

    expect(screen.getByText('Animated Glass Login Form')).toBeInTheDocument();
    expect(screen.getByText('Overview & Preview')).toBeInTheDocument();
    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.getByText('Compare Versions')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('latest')).toBeInTheDocument();
    });
  });

  it('switches to Version History tab and shows all published releases', async () => {
    vi.spyOn(api, 'getRegistryVersions').mockResolvedValue({
      slug: 'animated-login-form',
      versions: ['1.1.0', '1.0.0'],
      latest: '1.1.0',
      details: [
        { version: '1.1.0', publishedAt: new Date().toISOString(), changelog: 'Enhanced validation' },
        { version: '1.0.0', publishedAt: new Date().toISOString(), changelog: 'Initial release', deprecated: true, deprecationReason: 'Superceded by v1.1.0' },
      ],
    });

    render(
      <ComponentInspectorModal
        component={mockComponent}
        onClose={() => {}}
        isFavorite={() => false}
        toggleFavorite={() => {}}
        collections={[]}
        addComponentToCollection={async () => {}}
      />
    );

    const historyTab = screen.getByText('Version History');
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText('Published Releases')).toBeInTheDocument();
      expect(screen.getByText('Enhanced validation')).toBeInTheDocument();
      expect(screen.getByText('Initial release')).toBeInTheDocument();
      expect(screen.getByText('Deprecated')).toBeInTheDocument();
      expect(screen.getByText(/Superceded by v1.1.0/i)).toBeInTheDocument();
    });
  });

  it('switches to Compare Versions tab and displays file, dependency, and prop diffs', async () => {
    vi.spyOn(api, 'getRegistryVersions').mockResolvedValue({
      slug: 'animated-login-form',
      versions: ['1.1.0', '1.0.0'],
      latest: '1.1.0',
    });

    vi.spyOn(api, 'compareRegistryVersions').mockResolvedValue({
      slug: 'animated-login-form',
      fromVersion: '1.0.0',
      toVersion: '1.1.0',
      summary: {
        filesAdded: 1,
        filesRemoved: 0,
        filesModified: 1,
        filesUnchanged: 0,
        dependenciesChanged: 1,
        propsChanged: 1,
      },
      files: [
        {
          path: 'src/LoginForm.tsx',
          name: 'LoginForm.tsx',
          language: 'typescript',
          status: 'modified',
          lineDiff: [
            { type: 'eq', line: 'import React from "react";' },
            { type: 'del', line: 'const oldVar = 1;' },
            { type: 'add', line: 'const newVar = 2;' },
          ],
        },
      ],
      dependencies: { added: { 'motion/react': '^12.0.0' }, removed: {}, modified: {} },
      props: { added: [{ name: 'isCompact', type: 'boolean' }], removed: [], modified: [] },
      changelog: 'Version 1.1.0 release',
      toDeprecated: false,
    });

    render(
      <ComponentInspectorModal
        component={mockComponent}
        onClose={() => {}}
        isFavorite={() => false}
        toggleFavorite={() => {}}
        collections={[]}
        addComponentToCollection={async () => {}}
      />
    );

    // Wait for version initialization
    await waitFor(() => {
      expect(screen.getByText('latest')).toBeInTheDocument();
    });

    const compareBtn = screen.getByRole('button', { name: /Compare Versions/i });
    fireEvent.click(compareBtn);

    await waitFor(() => {
      expect(screen.getByText('Version Comparison')).toBeInTheDocument();
      expect(screen.getByText('File Differences')).toBeInTheDocument();
    });
  });
});

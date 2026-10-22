import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { detectProject, loadVacConfig, saveVacConfig } from './config';
import { validateManifestSafety, installRelease } from './installer';
import { initCommand } from './commands/init';
import { RegistryClient } from './registry-client';
import { RegistryManifest, RegistryManifestSchema } from '@vac/shared';
import { computeFileIntegrity } from '@vac/registry';

describe('Production CLI Architecture & Safe Installation Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vac-cli-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('1. Project Detection & Configuration', () => {
    it('throws error when no package.json is found', () => {
      expect(() => detectProject(tempDir)).toThrow(/No package.json found/);
    });

    it('throws error when target is not a React project', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'node-utility', dependencies: { express: '^4.0.0' } })
      );
      expect(() => detectProject(tempDir)).toThrow(/does not appear to be a React project/);
    });

    it('correctly detects React, TypeScript, and Tailwind in target project', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'my-react-app',
          dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
          devDependencies: { typescript: '^5.0.0', tailwindcss: '^3.4.0' },
        })
      );
      fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), '{}');
      fs.writeFileSync(path.join(tempDir, 'tailwind.config.js'), 'module.exports = {};');

      const detection = detectProject(tempDir);
      expect(detection.isReact).toBe(true);
      expect(detection.isTypeScript).toBe(true);
      expect(detection.hasTailwind).toBe(true);
    });

    it('initializes vac.config.json and creates component directory via initCommand', async () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'my-vite-app',
          dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
        })
      );
      fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), '{}');

      await initCommand({ cwd: tempDir, yes: true });

      const config = loadVacConfig(tempDir);
      expect(config).toBeDefined();
      expect(config?.typescript).toBe(true);
      expect(fs.existsSync(path.join(tempDir, config?.componentsDir || ''))).toBe(true);
    });
  });

  describe('2. Manifest Security & Integrity Validation', () => {
    const validManifest: RegistryManifest = {
      schemaVersion: '1.0.0',
      name: 'Safe Button',
      slug: 'safe-button',
      version: '1.0.0',
      description: 'A completely safe component',
      category: 'Buttons & Controls',
      files: [
        {
          path: 'src/components/SafeButton.tsx',
          name: 'SafeButton.tsx',
          content: 'export const SafeButton = () => <button>Click</button>;',
          language: 'typescript',
          isEntry: true,
          integrity: computeFileIntegrity('export const SafeButton = () => <button>Click</button>;'),
        },
      ],
      dependencies: { 'lucide-react': '^1.0.0' },
      devDependencies: {},
      peerDependencies: {},
      props: [],
      styling: { framework: 'tailwind' },
      license: 'MIT',
      author: 'VAC Team',
      publishedAt: new Date().toISOString(),
      deprecated: false,
    };

    it('passes validation for clean manifest with matching integrity hash', () => {
      expect(() => validateManifestSafety(validManifest)).not.toThrow();
    });

    it('rejects path traversal (..) attack in file paths', () => {
      const malicious = {
        ...validManifest,
        files: [
          {
            path: '../../etc/shadow',
            name: 'shadow',
            content: 'malicious',
            language: 'typescript' as const,
            isEntry: true,
          },
        ],
      };
      expect(() => validateManifestSafety(malicious)).toThrow(/Dangerous file path/);
    });

    it('rejects absolute paths in file entries', () => {
      const malicious = {
        ...validManifest,
        files: [
          {
            path: '/var/www/malicious.js',
            name: 'malicious.js',
            content: 'malicious',
            language: 'javascript' as const,
            isEntry: true,
          },
        ],
      };
      expect(() => validateManifestSafety(malicious)).toThrow(/Dangerous file path/);
    });

    it('rejects Windows drive letter paths in file entries', () => {
      const malicious = {
        ...validManifest,
        files: [
          {
            path: 'C:\\Windows\\System32\\malicious.dll.tsx',
            name: 'malicious.dll.tsx',
            content: 'malicious',
            language: 'typescript' as const,
            isEntry: true,
          },
        ],
      };
      expect(() => validateManifestSafety(malicious)).toThrow(/Dangerous file path/);
    });

    it('rejects unsupported extensions (.sh, .exe, .py, .bin)', () => {
      const malicious = {
        ...validManifest,
        files: [
          {
            path: 'src/components/exploit.sh',
            name: 'exploit.sh',
            content: 'rm -rf /',
            language: 'typescript' as const,
            isEntry: true,
          },
        ],
      };
      expect(() => validateManifestSafety(malicious)).toThrow(/Unsupported file extension/);
    });

    it('rejects oversized files exceeding 1MB limit', () => {
      const oversized = {
        ...validManifest,
        files: [
          {
            path: 'src/components/Oversized.tsx',
            name: 'Oversized.tsx',
            content: 'A'.repeat(1024 * 1024 + 10), // > 1MB
            language: 'typescript' as const,
            isEntry: true,
          },
        ],
      };
      expect(() => validateManifestSafety(oversized)).toThrow(/exceeds maximum allowable size/);
    });

    it('rejects invalid or non-semantic version strings', () => {
      const badVersion = {
        ...validManifest,
        version: '../../etc/passwd',
      };
      expect(() => validateManifestSafety(badVersion)).toThrow(/Invalid semantic version string/);

      const invalidVersion = {
        ...validManifest,
        version: 'v1.0.0-beta!@#',
      };
      expect(() => validateManifestSafety(invalidVersion)).toThrow(/Invalid semantic version string/);
    });

    it('rejects tampered file content when file integrity hash does not match', () => {
      const tampered = {
        ...validManifest,
        files: [
          {
            ...validManifest.files[0],
            content: 'export const SafeButton = () => <button>Tampered Content</button>;',
          },
        ],
      };
      expect(() => validateManifestSafety(tampered)).toThrow(/Integrity verification failure/);
    });

    it('rejects modified manifest when manifest-level integrity hash does not match', () => {
      const tamperedManifest = {
        ...validManifest,
        integrity: 'sha256-0000000000000000000000000000000000000000000000000000000000000000',
      };
      expect(() => validateManifestSafety(tamperedManifest)).toThrow(/Manifest integrity verification failure/);
    });
  });

  describe('3. File Installation into React Fixture Project', () => {
    it('installs source files and identifies missing dependencies', async () => {
      // Setup React project fixture
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'client-app',
          dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
        })
      );
      fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), '{}');

      const project = detectProject(tempDir);

      const manifest: RegistryManifest = {
        schemaVersion: '1.0.0',
        name: 'Glowing Card',
        slug: 'glowing-card',
        version: '1.0.0',
        description: 'Ambient spotlight card',
        category: 'Cards & Surfaces',
        files: [
          {
            path: 'src/components/GlowingCard.tsx',
            name: 'GlowingCard.tsx',
            content: 'import React from "react";\nexport const GlowingCard = () => <div className="card">Card</div>;',
            language: 'typescript',
            isEntry: true,
            integrity: computeFileIntegrity('import React from "react";\nexport const GlowingCard = () => <div className="card">Card</div>;'),
          },
        ],
        dependencies: { 'motion/react': '^12.0.0' },
        devDependencies: {},
        peerDependencies: {},
        props: [],
        styling: { framework: 'tailwind' },
        license: 'MIT',
        author: 'VAC Team',
        publishedAt: new Date().toISOString(),
        deprecated: false,
      };

      const result = await installRelease(manifest, project, {
        cwd: tempDir,
        targetDir: 'src/components/ui',
        overwrite: false,
        installDeps: true,
      });

      expect(result.slug).toBe('glowing-card');
      expect(result.version).toBe('1.0.0');
      expect(result.installedFiles.length).toBe(1);

      // Verify file was physically written to targetDir
      const installedFile = result.installedFiles[0];
      expect(fs.existsSync(installedFile)).toBe(true);
      expect(fs.readFileSync(installedFile, 'utf8')).toContain('export const GlowingCard');

      // Verify dependency detection
      expect(result.missingDependencies).toContain('motion/react@^12.0.0');

      // Verify package.json was updated with missing dependency
      const updatedPkg = JSON.parse(fs.readFileSync(path.join(tempDir, 'package.json'), 'utf8'));
      expect(updatedPkg.dependencies['motion/react']).toBe('^12.0.0');
    });

    it('respects overwrite setting when component file already exists', async () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({
          name: 'client-app',
          dependencies: { react: '^18.0.0' },
        })
      );
      const project = detectProject(tempDir);

      const targetPath = path.join(tempDir, 'src/components/ui/Duplicate.tsx');
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, 'Original User File');

      const manifest: RegistryManifest = {
        schemaVersion: '1.0.0',
        name: 'Duplicate',
        slug: 'duplicate-comp',
        version: '1.0.0',
        description: 'Duplicate test',
        category: 'Action Triggers',
        files: [
          {
            path: 'Duplicate.tsx',
            name: 'Duplicate.tsx',
            content: 'Registry Content',
            language: 'typescript',
            isEntry: true,
          },
        ],
        dependencies: {},
        devDependencies: {},
        peerDependencies: {},
        props: [],
        styling: { framework: 'tailwind' },
        license: 'MIT',
        author: 'VAC Team',
        publishedAt: new Date().toISOString(),
        deprecated: false,
      };

      // 1. Without overwrite: file should be skipped
      const resSkipped = await installRelease(manifest, project, {
        cwd: tempDir,
        targetDir: 'src/components/ui',
        overwrite: false,
      });
      expect(resSkipped.skippedFiles.length).toBe(1);
      expect(fs.readFileSync(targetPath, 'utf8')).toBe('Original User File');

      // 2. With overwrite: file should be replaced
      const resReplaced = await installRelease(manifest, project, {
        cwd: tempDir,
        targetDir: 'src/components/ui',
        overwrite: true,
      });
      expect(resReplaced.installedFiles.length).toBe(1);
      expect(fs.readFileSync(targetPath, 'utf8')).toBe('Registry Content');
    });
  });

  describe('4. RegistryClient Negative & Schema Tests', () => {
    it('rejects invalid or unsafe registry URLs', () => {
      expect(() => new RegistryClient('ftp://example.com/registry')).toThrow(/Invalid registry URL/);
      expect(() => new RegistryClient('javascript:alert(1)')).toThrow(/Invalid registry URL/);
      expect(() => new RegistryClient('file:///etc/passwd')).toThrow(/Invalid registry URL/);
    });

    it('rejects malformed manifest payloads missing mandatory fields', () => {
      const malformed = {
        name: 'Missing Slug',
        // slug missing
        version: '1.0.0',
      };
      expect(() => RegistryManifestSchema.parse(malformed)).toThrow();
    });

    it('rejects invalid semver format with helpful error guidance', async () => {
      const client = new RegistryClient('http://localhost:4000/api/registry');
      await expect(client.getReleaseManifest('animated-login-form', 'v-invalid-99')).rejects.toThrow(
        /Invalid version format "v-invalid-99"/
      );
    });

    it('returns helpful error message when non-existent version is requested', async () => {
      const client = new RegistryClient('http://localhost:4000/api/registry');
      await expect(client.getReleaseManifest('animated-login-form', '99.99.99')).rejects.toThrow(
        /Version "99.99.99" for component "animated-login-form" was not found/
      );
    });
  });

  describe('5. Package Manager Detection & Safe Dependency Handling', () => {
    it('detects pnpm, yarn, bun, and npm correctly from lockfiles', () => {
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'pm-test', dependencies: { react: '^18.0.0' } })
      );

      // pnpm
      fs.writeFileSync(path.join(tempDir, 'pnpm-lock.yaml'), '');
      expect(detectProject(tempDir).packageManager).toBe('pnpm');
      fs.unlinkSync(path.join(tempDir, 'pnpm-lock.yaml'));

      // yarn
      fs.writeFileSync(path.join(tempDir, 'yarn.lock'), '');
      expect(detectProject(tempDir).packageManager).toBe('yarn');
      fs.unlinkSync(path.join(tempDir, 'yarn.lock'));

      // bun
      fs.writeFileSync(path.join(tempDir, 'bun.lockb'), '');
      expect(detectProject(tempDir).packageManager).toBe('bun');
      fs.unlinkSync(path.join(tempDir, 'bun.lockb'));

      // npm
      fs.writeFileSync(path.join(tempDir, 'package-lock.json'), '');
      expect(detectProject(tempDir).packageManager).toBe('npm');
    });

    it('identifies missing declared dependencies and updates package.json when installDeps is true', async () => {
      const pkgPath = path.join(tempDir, 'package.json');
      fs.writeFileSync(
        pkgPath,
        JSON.stringify({ name: 'dep-test', dependencies: { react: '^18.0.0' } })
      );

      const project = detectProject(tempDir);
      const manifest: RegistryManifest = {
        schemaVersion: '1.0.0',
        name: 'Dep Comp',
        slug: 'dep-comp',
        version: '1.0.0',
        description: 'Test deps',
        category: 'Action Triggers',
        files: [
          {
            path: 'DepComp.tsx',
            name: 'DepComp.tsx',
            content: 'export const DepComp = () => <div />;',
            language: 'typescript',
            isEntry: true,
          },
        ],
        dependencies: {
          'motion/react': '^12.0.0',
          'lucide-react': '^1.0.0',
        },
        devDependencies: {},
        peerDependencies: {},
        props: [],
        styling: { framework: 'tailwind' },
        license: 'MIT',
        author: 'VAC Team',
        publishedAt: new Date().toISOString(),
        deprecated: false,
      };

      const result = await installRelease(manifest, project, {
        cwd: tempDir,
        targetDir: 'src/components',
        installDeps: true,
      });

      expect(result.missingDependencies.length).toBe(2);
      expect(result.missingDependencies).toContain('motion/react@^12.0.0');
      expect(result.missingDependencies).toContain('lucide-react@^1.0.0');

      const updatedPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      expect(updatedPkg.dependencies['motion/react']).toBe('^12.0.0');
      expect(updatedPkg.dependencies['lucide-react']).toBe('^1.0.0');
    });
  });
});

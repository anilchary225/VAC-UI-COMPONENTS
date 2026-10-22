import fs from 'fs';
import path from 'path';

export interface VacConfig {
  $schema?: string;
  typescript: boolean;
  tailwind: boolean;
  componentsDir: string;
  registryUrl: string;
}

export interface ProjectDetection {
  isReact: boolean;
  isTypeScript: boolean;
  hasTailwind: boolean;
  packageManager: 'pnpm' | 'npm' | 'yarn' | 'bun';
  packageJsonPath: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  componentsDir: string;
}

export function detectProject(cwd: string): ProjectDetection {
  const packageJsonPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(
      `No package.json found in "${cwd}". Please run this command inside the root of a React project.`
    );
  }

  let pkg: any = {};
  try {
    pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (err: any) {
    throw new Error(`Failed to parse package.json: ${err.message}`);
  }

  const dependencies: Record<string, string> = pkg.dependencies || {};
  const devDependencies: Record<string, string> = pkg.devDependencies || {};
  const peerDependencies: Record<string, string> = pkg.peerDependencies || {};

  const isReact = Boolean(
    dependencies.react ||
      devDependencies.react ||
      peerDependencies.react ||
      dependencies['react-dom'] ||
      devDependencies['react-dom']
  );

  if (!isReact) {
    throw new Error(
      'Target directory does not appear to be a React project. "react" dependency was not detected in package.json.'
    );
  }

  const isTypeScript =
    fs.existsSync(path.join(cwd, 'tsconfig.json')) ||
    Boolean(devDependencies.typescript || dependencies.typescript);

  const hasTailwind =
    fs.existsSync(path.join(cwd, 'tailwind.config.js')) ||
    fs.existsSync(path.join(cwd, 'tailwind.config.ts')) ||
    fs.existsSync(path.join(cwd, 'tailwind.config.mjs')) ||
    Boolean(dependencies.tailwindcss || devDependencies.tailwindcss || dependencies['@tailwindcss/vite']);

  // Detect package manager from lockfiles
  let packageManager: 'pnpm' | 'npm' | 'yarn' | 'bun' = 'npm';
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
    packageManager = 'pnpm';
  } else if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
    packageManager = 'yarn';
  } else if (fs.existsSync(path.join(cwd, 'bun.lockb')) || fs.existsSync(path.join(cwd, 'bun.lock'))) {
    packageManager = 'bun';
  } else if (fs.existsSync(path.join(cwd, 'package-lock.json'))) {
    packageManager = 'npm';
  }

  // Determine standard components directory
  let componentsDir = 'src/components/ui';
  if (fs.existsSync(path.join(cwd, 'src/components'))) {
    componentsDir = 'src/components';
  } else if (fs.existsSync(path.join(cwd, 'components'))) {
    componentsDir = 'components';
  }

  return {
    isReact,
    isTypeScript,
    hasTailwind,
    packageManager,
    packageJsonPath,
    dependencies,
    devDependencies,
    componentsDir,
  };
}

export function loadVacConfig(cwd: string): VacConfig | null {
  const configPath = path.join(cwd, 'vac.config.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveVacConfig(cwd: string, config: VacConfig): void {
  const configPath = path.join(cwd, 'vac.config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

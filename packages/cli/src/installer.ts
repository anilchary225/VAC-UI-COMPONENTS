import fs from 'fs';
import path from 'path';
import { RegistryManifest } from '@vac/shared';
import { computeFileIntegrity, computeManifestIntegrity } from '@vac/registry';
import { ProjectDetection } from './config';

const ALLOWED_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.json'];
const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1MB
const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9a-zA-Z.-]+))?(?:\+([0-9a-zA-Z.-]+))?$/;

export interface InstallationOptions {
  cwd: string;
  targetDir?: string;
  overwrite?: boolean;
  installDeps?: boolean;
}

export interface InstallationResult {
  slug: string;
  version: string;
  installedFiles: string[];
  skippedFiles: string[];
  missingDependencies: string[];
  importPath: string;
  stylingFramework: string;
  setupInstructions?: string;
}

export function validateManifestSafety(manifest: RegistryManifest): void {
  // 0. Version string validation
  if (!manifest.version || !SEMVER_REGEX.test(manifest.version)) {
    throw new Error(
      `Security violation: Invalid semantic version string "${manifest.version}" in component "${manifest.slug}".`
    );
  }

  // 1. Manifest integrity verification
  if (manifest.integrity) {
    const calculatedManifestHash = computeManifestIntegrity(manifest);
    if (manifest.integrity !== calculatedManifestHash) {
      throw new Error(
        `Manifest integrity verification failure for "${manifest.slug}@${manifest.version}": Expected manifest hash ${manifest.integrity}, but computed ${calculatedManifestHash}. Aborting installation.`
      );
    }
  }

  for (const file of manifest.files) {
    const rawPath = file.path;

    // 2. Path safety
    if (!rawPath || typeof rawPath !== 'string') {
      throw new Error(`Invalid file entry with empty path in manifest for "${manifest.slug}".`);
    }

    if (
      rawPath.includes('..') ||
      rawPath.startsWith('/') ||
      rawPath.startsWith('\\') ||
      rawPath.includes('\0') ||
      /^[a-zA-Z]:/.test(rawPath)
    ) {
      throw new Error(
        `Security violation: Dangerous file path "${rawPath}" detected in component "${manifest.slug}". Path traversal and absolute paths are prohibited.`
      );
    }

    // 2. Extension check
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => rawPath.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      throw new Error(
        `Security violation: Unsupported file extension in "${rawPath}". Allowed extensions: ${ALLOWED_EXTENSIONS.join(
          ', '
        )}.`
      );
    }

    // 3. File size limit
    const byteLength = Buffer.byteLength(file.content, 'utf8');
    if (byteLength > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `Security violation: File "${rawPath}" exceeds maximum allowable size of 1MB (${byteLength} bytes).`
      );
    }

    // 4. File integrity verification
    if (file.integrity) {
      const calculatedHash = computeFileIntegrity(file.content);
      if (file.integrity !== calculatedHash) {
        throw new Error(
          `Integrity verification failure in "${rawPath}": Expected hash ${file.integrity}, but computed ${calculatedHash}. Aborting installation.`
        );
      }
    }
  }
}

export async function installRelease(
  manifest: RegistryManifest,
  project: ProjectDetection,
  options: InstallationOptions
): Promise<InstallationResult> {
  // 1. Validate manifest security and integrity
  validateManifestSafety(manifest);

  const baseComponentsDir = options.targetDir || project.componentsDir || 'src/components';
  const installedFiles: string[] = [];
  const skippedFiles: string[] = [];

  // Determine entry file and PascalCase component name
  const entryFile = manifest.files.find((f) => f.isEntry) || manifest.files[0];
  const componentDir = path.join(options.cwd, baseComponentsDir);

  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  // 2. Write each file safely
  for (const file of manifest.files) {
    const fileName = path.basename(file.path);
    const destPath = path.resolve(componentDir, fileName);
    if (!destPath.startsWith(path.resolve(componentDir))) {
      throw new Error(
        `Security violation: Resolved destination "${destPath}" escapes component directory "${componentDir}".`
      );
    }

    if (fs.existsSync(destPath) && !options.overwrite) {
      skippedFiles.push(destPath);
      continue;
    }

    // Atomic write
    const tmpPath = `${destPath}.${Date.now()}.tmp`;
    fs.writeFileSync(tmpPath, file.content, 'utf8');
    fs.renameSync(tmpPath, destPath);
    installedFiles.push(destPath);
  }

  // 3. Compare dependencies
  const declaredDeps = manifest.dependencies || {};
  const currentDeps = {
    ...project.dependencies,
    ...project.devDependencies,
  };

  const missingDependencies: string[] = [];
  for (const [pkg, ver] of Object.entries(declaredDeps)) {
    if (!currentDeps[pkg]) {
      missingDependencies.push(`${pkg}@${ver}`);
    }
  }

  // 4. Automatically update package.json dependencies if requested
  if (options.installDeps && missingDependencies.length > 0) {
    try {
      const pkgJson = JSON.parse(fs.readFileSync(project.packageJsonPath, 'utf8'));
      pkgJson.dependencies = pkgJson.dependencies || {};
      for (const [pkg, ver] of Object.entries(declaredDeps)) {
        if (!pkgJson.dependencies[pkg]) {
          pkgJson.dependencies[pkg] = ver;
        }
      }
      fs.writeFileSync(project.packageJsonPath, JSON.stringify(pkgJson, null, 2), 'utf8');
    } catch (err: any) {
      console.warn('Could not update package.json automatically:', err.message);
    }
  }

  // Determine relative import path
  const entryName = entryFile ? path.basename(entryFile.path, path.extname(entryFile.path)) : manifest.slug;
  const importPath = `./${baseComponentsDir}/${entryName}`.replace(/\/+/g, '/');

  return {
    slug: manifest.slug,
    version: manifest.version,
    installedFiles,
    skippedFiles,
    missingDependencies,
    importPath,
    stylingFramework: manifest.styling?.framework || 'tailwind',
    setupInstructions: manifest.setupInstructions,
  };
}

import { ComponentFile, ComponentProp, RegistryManifestSchema } from '@vac/shared';
import { AdminStore } from './admin.store';

export interface ValidationIssue {
  field?: string;
  file?: string;
  message: string;
}

export interface ComponentValidationReport {
  valid: boolean;
  errors: string[];
  issues: ValidationIssue[];
  checkedAt: Date;
}

// NPM package name regex matching npm specs
const NPM_PACKAGE_NAME_REGEX = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
const DISALLOWED_PACKAGES = new Set([
  'fs',
  'child_process',
  'net',
  'cluster',
  'dns',
  'tls',
  'dgram',
  'v8',
]);

const ALLOWED_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.json'];

export async function validateComponentDraft(params: {
  id?: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  license?: string;
  author?: string;
  files: ComponentFile[];
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  props?: ComponentProp[];
  version?: string;
}): Promise<ComponentValidationReport> {
  const issues: ValidationIssue[] = [];

  // 1. Slug validation
  const slug = (params.slug || '').trim().toLowerCase();
  if (!slug) {
    issues.push({ field: 'slug', message: 'Component slug is required.' });
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    issues.push({
      field: 'slug',
      message: 'Slug must consist of lowercase alphanumeric words separated by single hyphens (e.g. animated-login-form).',
    });
  } else if (slug.length < 2 || slug.length > 80) {
    issues.push({
      field: 'slug',
      message: 'Slug length must be between 2 and 80 characters.',
    });
  } else {
    // Uniqueness check
    const existing = await AdminStore.findBySlugOrId(slug);
    if (existing && existing.id !== params.id && existing.slug !== params.slug) {
      issues.push({
        field: 'slug',
        message: `A component with slug "${slug}" already exists in the catalog.`,
      });
    }
  }

  // 2. Name & Description metadata validation
  const name = (params.name || '').trim();
  if (!name) {
    issues.push({ field: 'name', message: 'Component name is required.' });
  } else if (name.length < 2 || name.length > 100) {
    issues.push({ field: 'name', message: 'Name must be between 2 and 100 characters.' });
  }

  const description = (params.description || '').trim();
  if (!description) {
    issues.push({ field: 'description', message: 'Component description is required.' });
  } else if (description.length < 5 || description.length > 500) {
    issues.push({
      field: 'description',
      message: 'Description must be between 5 and 500 characters.',
    });
  }

  // 3. Category validation
  const category = (params.category || '').trim();
  if (!category) {
    issues.push({ field: 'category', message: 'Component category is required.' });
  }

  // 4. Source Files Validation & Path Safety
  const files = params.files || [];
  if (!files || files.length === 0) {
    issues.push({
      field: 'files',
      message: 'At least one source file is required (e.g., index.tsx).',
    });
  } else {
    let hasEntry = false;
    const filePaths = new Set<string>();

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const filePath = (f.path || '').trim();
      const fileName = (f.name || '').trim();

      // Path safety checks
      if (!filePath) {
        issues.push({ field: `files[${i}]`, message: 'File path cannot be empty.' });
        continue;
      }

      if (filePath.includes('..') || filePath.startsWith('/') || filePath.startsWith('\\') || filePath.includes('\0')) {
        issues.push({
          field: `files[${i}].path`,
          file: filePath,
          message: `Unsafe file path rejected: "${filePath}". Path traversal and absolute paths are prohibited.`,
        });
        continue;
      }

      if (filePaths.has(filePath)) {
        issues.push({
          field: `files[${i}].path`,
          file: filePath,
          message: `Duplicate file path in component: "${filePath}".`,
        });
      }
      filePaths.add(filePath);

      // Extension validation
      const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => filePath.toLowerCase().endsWith(ext));
      if (!hasValidExt) {
        issues.push({
          field: `files[${i}].path`,
          file: filePath,
          message: `File "${filePath}" must have a valid extension: ${ALLOWED_EXTENSIONS.join(', ')}.`,
        });
      }

      // Entry file check
      if (f.isEntry || fileName === 'index.tsx' || fileName === 'index.jsx' || filePath.endsWith('/index.tsx')) {
        hasEntry = true;
      }

      // Syntax / Content checks
      const content = f.content || '';
      if (!content.trim()) {
        issues.push({
          field: `files[${i}].content`,
          file: filePath,
          message: `Source file "${filePath}" is empty.`,
        });
      } else {
        // Simple balanced bracket check to catch gross syntax errors
        const bracketCheck = checkBalancedBrackets(content);
        if (!bracketCheck.balanced) {
          issues.push({
            field: `files[${i}].content`,
            file: filePath,
            message: `Syntax error in "${filePath}": Unmatched or unclosed ${bracketCheck.errorSymbol}.`,
          });
        }
      }
    }

    if (!hasEntry) {
      issues.push({
        field: 'files',
        message: 'No entry point file found. Please mark a file with isEntry: true or name it index.tsx.',
      });
    }
  }

  // 5. Dependency Declarations Validation
  const dependencies = params.dependencies || {};
  for (const [pkg, ver] of Object.entries(dependencies)) {
    if (!NPM_PACKAGE_NAME_REGEX.test(pkg)) {
      issues.push({
        field: `dependencies.${pkg}`,
        message: `Invalid package name "${pkg}".`,
      });
    }
    if (DISALLOWED_PACKAGES.has(pkg)) {
      issues.push({
        field: `dependencies.${pkg}`,
        message: `Package "${pkg}" is a restricted system module and cannot be declared as a client dependency.`,
      });
    }
    if (!ver || typeof ver !== 'string') {
      issues.push({
        field: `dependencies.${pkg}`,
        message: `Version specification for "${pkg}" must be a non-empty string (e.g. "^18.0.0").`,
      });
    }
  }

  // 6. Manifest Schema Validation
  if (files.length > 0 && slug && name) {
    const candidateManifest = {
      schemaVersion: '1.0.0' as const,
      name,
      slug,
      version: params.version || '1.0.0',
      description,
      category,
      dependencies: params.dependencies || {},
      devDependencies: {},
      peerDependencies: params.peerDependencies || {},
      files,
      props: params.props || [],
      styling: { framework: 'tailwind' as const },
      license: params.license || 'MIT',
      author: params.author || 'VAC Team',
      publishedAt: new Date().toISOString(),
    };

    const manifestParsed = RegistryManifestSchema.safeParse(candidateManifest);
    if (!manifestParsed.success) {
      for (const err of manifestParsed.error.errors) {
        issues.push({
          field: err.path.join('.'),
          message: `Manifest schema violation: ${err.message}`,
        });
      }
    }
  }

  const errors = issues.map((i) => (i.file ? `[${i.file}] ${i.message}` : i.message));

  return {
    valid: issues.length === 0,
    errors,
    issues,
    checkedAt: new Date(),
  };
}

function checkBalancedBrackets(code: string): { balanced: boolean; errorSymbol?: string } {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  let inString: string | null = null;
  let inComment = false;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const prev = i > 0 ? code[i - 1] : '';

    // Simple string literal skip
    if ((char === '"' || char === "'" || char === '`') && prev !== '\\') {
      if (inString === char) inString = null;
      else if (!inString && !inComment) inString = char;
      continue;
    }
    if (inString) continue;

    // Line comment skip
    if (char === '/' && code[i + 1] === '/' && !inComment) {
      const nextLine = code.indexOf('\n', i);
      if (nextLine === -1) break;
      i = nextLine;
      continue;
    }

    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (char === ')' || char === '}' || char === ']') {
      const expected = map[char];
      if (stack.length === 0 || stack[stack.length - 1] !== expected) {
        return { balanced: false, errorSymbol: char };
      }
      stack.pop();
    }
  }

  if (stack.length > 0) {
    return { balanced: false, errorSymbol: stack[stack.length - 1] };
  }

  return { balanced: true };
}

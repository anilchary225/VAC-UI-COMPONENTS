import { describe, it, expect } from 'vitest';
import {
  RegisterRequestSchema,
  ComponentSummarySchema,
  RegistryManifestSchema,
} from './index';

describe('Shared Schemas Smoke Tests', () => {
  it('validates a valid registration request', () => {
    const valid = {
      name: 'Developer One',
      email: 'dev@vac.ui',
      password: 'strongpassword123',
    };
    const parsed = RegisterRequestSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid email in registration', () => {
    const invalid = {
      name: 'Developer One',
      email: 'not-an-email',
      password: 'strongpassword123',
    };
    const parsed = RegisterRequestSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('validates a valid component manifest', () => {
    const manifest = {
      schemaVersion: '1.0.0',
      name: 'Animated Login Form',
      slug: 'animated-login-form',
      version: '1.0.0',
      description: 'A smooth animated login form with validation and micro-interactions.',
      category: 'Authentication',
      dependencies: {
        'motion/react': '^12.0.0',
        'lucide-react': '^1.0.0',
      },
      devDependencies: {},
      peerDependencies: {
        react: '>=18.0.0',
      },
      files: [
        {
          path: 'src/components/AnimatedLoginForm.tsx',
          name: 'AnimatedLoginForm.tsx',
          content: 'export const AnimatedLoginForm = () => null;',
          language: 'typescript',
          isEntry: true,
        },
      ],
      props: [
        {
          name: 'onSubmit',
          type: '(data: LoginFormData) => Promise<void>',
          required: true,
          description: 'Callback when form is successfully submitted',
        },
      ],
      styling: {
        framework: 'tailwind',
      },
      license: 'MIT',
      author: 'VAC Team',
      publishedAt: new Date().toISOString(),
    };

    const parsed = RegistryManifestSchema.safeParse(manifest);
    expect(parsed.success).toBe(true);
  });
});

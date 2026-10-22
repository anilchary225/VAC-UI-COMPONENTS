import { z } from 'zod';
import { ComponentFileSchema, ComponentPropSchema } from './component';

export const RegistryManifestSchema = z.object({
  $schema: z.string().optional(),
  schemaVersion: z.literal('1.0.0'),
  name: z.string(),
  slug: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/, 'Must follow semver format (e.g. 1.0.0)'),
  description: z.string(),
  category: z.string(),
  entryPoint: z.string().optional(),
  dependencies: z.record(z.string()).default({}),
  devDependencies: z.record(z.string()).default({}),
  peerDependencies: z.record(z.string()).default({}),
  files: z.array(ComponentFileSchema),
  props: z.array(ComponentPropSchema).default([]),
  styling: z
    .object({
      framework: z.enum(['tailwind', 'css', 'none']).default('tailwind'),
      cssVariables: z.record(z.string()).optional(),
      requiredCss: z.string().optional(),
    })
    .default({ framework: 'tailwind' }),
  setupInstructions: z.string().optional(),
  license: z.string().default('MIT'),
  author: z.string().default('VAC Team'),
  integrity: z.string().optional(),
  changelog: z.string().optional(),
  publishedAt: z.string(),
  deprecated: z.boolean().default(false),
  deprecationReason: z.string().optional(),
});

export type RegistryManifest = z.infer<typeof RegistryManifestSchema>;

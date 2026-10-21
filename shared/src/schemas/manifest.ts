import { z } from 'zod';
import { ComponentFileSchema, ComponentPropSchema } from './component';

export const RegistryManifestSchema = z.object({
  $schema: z.string().optional(),
  schemaVersion: z.literal('1.0.0'),
  name: z.string(),
  slug: z.string(),
  version: z.string(),
  description: z.string(),
  category: z.string(),
  dependencies: z.record(z.string()).default({}),
  devDependencies: z.record(z.string()).default({}),
  peerDependencies: z.record(z.string()).default({}),
  files: z.array(ComponentFileSchema),
  props: z.array(ComponentPropSchema).default([]),
  styling: z.object({
    framework: z.literal('tailwind'),
    cssVariables: z.record(z.string()).optional(),
  }).default({ framework: 'tailwind' }),
  license: z.string().default('MIT'),
  author: z.string().default('VAC Team'),
  integrity: z.string().optional(),
  publishedAt: z.string(),
});
export type RegistryManifest = z.infer<typeof RegistryManifestSchema>;

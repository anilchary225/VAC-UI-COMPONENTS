import { z } from 'zod';

export const ComponentStatusSchema = z.enum(['draft', 'in_review', 'published', 'deprecated']);
export type ComponentStatus = z.infer<typeof ComponentStatusSchema>;

export const ComponentPropSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().default(false),
  defaultValue: z.string().optional(),
  description: z.string(),
});
export type ComponentProp = z.infer<typeof ComponentPropSchema>;

export const ComponentFileSchema = z.object({
  path: z.string(),
  name: z.string(),
  content: z.string(),
  language: z.enum(['typescript', 'javascript', 'css', 'json']),
  isEntry: z.boolean().default(false),
});
export type ComponentFile = z.infer<typeof ComponentFileSchema>;

export const ComponentVersionSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/, 'Must follow semver format (e.g. 1.0.0)'),
  changelog: z.string().default(''),
  dependencies: z.record(z.string()).default({}),
  peerDependencies: z.record(z.string()).default({}),
  files: z.array(ComponentFileSchema),
  props: z.array(ComponentPropSchema).default([]),
  integrityHash: z.string().optional(),
  publishedAt: z.string().optional(),
  publishedBy: z.string().optional(),
});
export type ComponentVersion = z.infer<typeof ComponentVersionSchema>;

export const ComponentSummarySchema = z.object({
  id: z.string(),
  slug: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  status: ComponentStatusSchema,
  currentVersion: z.string(),
  previewComponent: z.string().optional(),
  isOfficial: z.boolean().default(true),
  downloadsCount: z.number().default(0),
  favoritesCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ComponentSummary = z.infer<typeof ComponentSummarySchema>;

export const ComponentDetailSchema = ComponentSummarySchema.extend({
  documentation: z.string().default(''),
  versions: z.array(ComponentVersionSchema).optional().default([]),
  latestRelease: ComponentVersionSchema.optional(),
  license: z.string().default('MIT'),
  author: z.string().default('VAC Team'),
});
export type ComponentDetail = z.infer<typeof ComponentDetailSchema>;

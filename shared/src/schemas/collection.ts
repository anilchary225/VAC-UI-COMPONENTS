import { z } from 'zod';

export const CollectionItemSchema = z.object({
  componentSlug: z.string(),
  addedAt: z.string(),
  order: z.number().default(0),
});
export type CollectionItem = z.infer<typeof CollectionItemSchema>;

export const CollectionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  items: z.array(CollectionItemSchema).default([]),
  isPrivate: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Collection = z.infer<typeof CollectionSchema>;

export const CreateCollectionRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(300).optional(),
});
export type CreateCollectionRequest = z.infer<typeof CreateCollectionRequestSchema>;

import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
  description: z.string().max(200),
  icon: z.string().default('Folder'),
  componentCount: z.number().default(0),
});
export type Category = z.infer<typeof CategorySchema>;

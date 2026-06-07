import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Category name is required' })
      .min(2, 'Category name must be at least 2 characters')
      .max(100, 'Category name cannot exceed 100 characters'),
    description: z.string().optional().nullable(),
    image: z.string().url('Invalid image URL').optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional().nullable(),
    image: z.string().url('Invalid image URL').optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

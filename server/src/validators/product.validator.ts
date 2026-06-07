import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    category_id: z.string({ required_error: 'Category ID is required' }).uuid('Invalid category ID'),
    name: z.string({ required_error: 'Product name is required' }).min(2, 'Name must be at least 2 characters'),
    description: z.string().optional().nullable(),
    image: z.string().url('Invalid image URL').optional().nullable(),
    puff_count: z.number().int().positive().optional().nullable(),
    nicotine_strength: z.number().nonnegative().optional().nullable(),
    price: z.number({ required_error: 'Price is required' }).positive('Price must be greater than zero'),
    availability: z.enum(['in_stock', 'out_of_stock', 'discontinued']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    flavors: z.array(z.string()).optional(), // Optional list of initial flavor strings
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    category_id: z.string().uuid().optional(),
    name: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    image: z.string().url().optional().nullable(),
    puff_count: z.number().int().positive().optional().nullable(),
    nicotine_strength: z.number().nonnegative().optional().nullable(),
    price: z.number().positive().optional(),
    availability: z.enum(['in_stock', 'out_of_stock', 'discontinued']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

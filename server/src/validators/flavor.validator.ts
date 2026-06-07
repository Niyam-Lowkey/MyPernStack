import { z } from 'zod';

export const createFlavorSchema = z.object({
  body: z.object({
    product_id: z.string({ required_error: 'Product ID is required' }).uuid('Invalid product ID'),
    flavor_name: z.string({ required_error: 'Flavor name is required' }).min(1, 'Flavor name cannot be empty'),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const updateFlavorSchema = z.object({
  body: z.object({
    flavor_name: z.string().min(1).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

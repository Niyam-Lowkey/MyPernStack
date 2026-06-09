"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        category_id: zod_1.z.string({ required_error: 'Category ID is required' }).uuid('Invalid category ID'),
        name: zod_1.z.string({ required_error: 'Product name is required' }).min(2, 'Name must be at least 2 characters'),
        description: zod_1.z.string().optional().nullable(),
        image: zod_1.z.string().url('Invalid image URL').optional().nullable(),
        puff_count: zod_1.z.number().int().positive().optional().nullable(),
        nicotine_strength: zod_1.z.number().nonnegative().optional().nullable(),
        price: zod_1.z.number({ required_error: 'Price is required' }).positive('Price must be greater than zero'),
        availability: zod_1.z.enum(['in_stock', 'out_of_stock', 'discontinued']).optional(),
        status: zod_1.z.enum(['active', 'inactive']).optional(),
        flavors: zod_1.z.array(zod_1.z.string()).optional(), // Optional list of initial flavor strings
    }),
});
exports.updateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        category_id: zod_1.z.string().uuid().optional(),
        name: zod_1.z.string().min(2).optional(),
        description: zod_1.z.string().optional().nullable(),
        image: zod_1.z.string().url().optional().nullable(),
        puff_count: zod_1.z.number().int().positive().optional().nullable(),
        nicotine_strength: zod_1.z.number().nonnegative().optional().nullable(),
        price: zod_1.z.number().positive().optional(),
        availability: zod_1.z.enum(['in_stock', 'out_of_stock', 'discontinued']).optional(),
        status: zod_1.z.enum(['active', 'inactive']).optional(),
    }),
});

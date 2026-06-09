"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({ required_error: 'Category name is required' })
            .min(2, 'Category name must be at least 2 characters')
            .max(100, 'Category name cannot exceed 100 characters'),
        description: zod_1.z.string().optional().nullable(),
        image: zod_1.z.string().url('Invalid image URL').optional().nullable(),
        status: zod_1.z.enum(['active', 'inactive']).optional(),
    }),
});
exports.updateCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100).optional(),
        description: zod_1.z.string().optional().nullable(),
        image: zod_1.z.string().url('Invalid image URL').optional().nullable(),
        status: zod_1.z.enum(['active', 'inactive']).optional(),
    }),
});

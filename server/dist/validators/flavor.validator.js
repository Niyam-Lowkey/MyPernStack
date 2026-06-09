"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFlavorSchema = exports.createFlavorSchema = void 0;
const zod_1 = require("zod");
exports.createFlavorSchema = zod_1.z.object({
    body: zod_1.z.object({
        product_id: zod_1.z.string({ required_error: 'Product ID is required' }).uuid('Invalid product ID'),
        flavor_name: zod_1.z.string({ required_error: 'Flavor name is required' }).min(1, 'Flavor name cannot be empty'),
        status: zod_1.z.enum(['active', 'inactive']).optional(),
    }),
});
exports.updateFlavorSchema = zod_1.z.object({
    body: zod_1.z.object({
        flavor_name: zod_1.z.string().min(1).optional(),
        status: zod_1.z.enum(['active', 'inactive']).optional(),
    }),
});

import { Router } from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();

// Authenticated routes (login required for all users)
router.get('/', protect as any, getProducts);
router.get('/:idOrSlug', protect as any, getProductByIdOrSlug);

// Admin-only routes
router.post('/', protect as any, restrictTo('admin') as any, validate(createProductSchema), createProduct);
router.put('/:id', protect as any, restrictTo('admin') as any, validate(updateProductSchema), updateProduct);
router.delete('/:id', protect as any, restrictTo('admin') as any, deleteProduct);

export default router;

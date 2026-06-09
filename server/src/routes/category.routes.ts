import { Router } from 'express';
import {
  getCategories,
  getCategoryByIdOrSlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';

const router = Router();

// Authenticated routes (login required for all users)
router.get('/', protect as any, getCategories);
router.get('/:idOrSlug', protect as any, getCategoryByIdOrSlug);

// Admin-only routes
router.post('/', protect as any, restrictTo('admin') as any, validate(createCategorySchema), createCategory);
router.put('/:id', protect as any, restrictTo('admin') as any, validate(updateCategorySchema), updateCategory);
router.delete('/:id', protect as any, restrictTo('admin') as any, deleteCategory);

export default router;

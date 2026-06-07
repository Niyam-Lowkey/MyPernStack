import { Router } from 'express';
import {
  getFlavors,
  createFlavor,
  updateFlavor,
  deleteFlavor,
} from '../controllers/flavor.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import { createFlavorSchema, updateFlavorSchema } from '../validators/flavor.validator';

const router = Router();

// Public routes
router.get('/', getFlavors);

// Admin-only routes
router.post('/', protect as any, restrictTo('admin') as any, validate(createFlavorSchema), createFlavor);
router.put('/:id', protect as any, restrictTo('admin') as any, validate(updateFlavorSchema), updateFlavor);
router.delete('/:id', protect as any, restrictTo('admin') as any, deleteFlavor);

export default router;

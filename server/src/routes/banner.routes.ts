import { Router } from 'express';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/banner.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Authenticated routes (login required for all users)
router.get('/', protect as any, getBanners);

// Admin-only routes
router.post('/', protect as any, restrictTo('admin') as any, createBanner);
router.put('/:id', protect as any, restrictTo('admin') as any, updateBanner);
router.delete('/:id', protect as any, restrictTo('admin') as any, deleteBanner);

export default router;

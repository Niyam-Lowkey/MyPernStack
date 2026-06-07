import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';

const router = Router();

// Only authenticated admins can upload images
router.post(
  '/',
  protect as any,
  restrictTo('admin') as any,
  upload.single('image'),
  uploadImage as any
);

export default router;

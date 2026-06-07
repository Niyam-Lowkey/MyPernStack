import { Router } from 'express';
import { login, refresh, logout, getMe } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import { loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect as any, getMe as any);

export default router;

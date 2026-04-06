import { Router } from 'express';
import { register, login, logout } from './auth-controller.js';
import { authLimiter } from '../../middleware/rate-limiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

export default router;

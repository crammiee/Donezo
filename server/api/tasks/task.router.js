import { Router } from 'express';
import { getTasks, syncTasks } from './task.controller.js';
import { requireAuth } from '../../middleware/auth-middleware.js';
import { taskLimiter } from '../../middleware/rate-limiter.js';

const router = Router();

router.get('/', requireAuth, taskLimiter, getTasks);
router.post('/', requireAuth, taskLimiter, syncTasks);

export default router;

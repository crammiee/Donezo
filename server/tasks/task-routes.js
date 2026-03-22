import { Router } from 'express';
import { requireAuth } from '../middleware/auth-middleware.js';
import { getTasksByUser, getTasksSince, processBatch } from './task-service.js';
import { broadcastTaskEvent } from '../services/socket-service.js';
import { taskLimiter } from '../middleware/rate-limiter.js';

const router = Router();

// GET /tasks
router.get('/', requireAuth, taskLimiter, async (req, res) => {
  try {
    const tasks = req.query.since
      ? await getTasksSince(req.userId, req.query.since)
      : await getTasksByUser(req.userId);
    res.status(200).json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /tasks  (create, update, soft-delete)
router.post('/', requireAuth, taskLimiter, async (req, res) => {
  if (!Array.isArray(req.body.tasks))
    return res.status(400).json({ error: 'tasks must be an array' });

  try {
    const tasks = await processBatch(req.body.tasks, req.userId);
    broadcastTaskEvent(req.userId, 'tasks:updated', tasks, req.headers['x-socket-id']);
    res.status(200).json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process batch' });
  }
});

export default router;

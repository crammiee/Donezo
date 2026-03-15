import { Router } from 'express';
import { requireAuth } from '../middleware/auth-middleware.js';
import { getTasks, processBatch } from './task-service.js';

const router = Router();

// GET /tasks
router.get('/', requireAuth, async (req, res) => {
  try {
    const tasks = await getTasks(req.userId);
    res.status(200).json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /tasks  (create, update, soft-delete)
router.post('/', requireAuth, async (req, res) => {
  try {
    const tasks = await processBatch(req.body.tasks, req.userId);
    res.status(200).json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process batch' });
  }
});

export default router;

import { getTasksByUser, getTasksSince, processBatch } from './task-service.js';
import { broadcastTaskEvent } from '../../services/socket-service.js';

export async function getTasks(req, res) {
  try {
    const tasks = req.query.since
      ? await getTasksSince(req.userId, req.query.since)
      : await getTasksByUser(req.userId);
    res.status(200).json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

export async function syncTasks(req, res) {
  if (!Array.isArray(req.body.tasks)) {
    return res.status(400).json({ error: 'tasks must be an array' });
  }
  try {
    const { tasks, idMappings } = await processBatch(req.body.tasks, req.userId);
    broadcastTaskEvent(req.userId, 'tasks:updated', tasks, req.headers['x-socket-id']);
    res.status(200).json({ tasks, idMappings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process batch' });
  }
}

import { API_BASE } from '../config.js';
import { getToken } from './auth-service.js';
import { getSocketId } from './socket-service.js';

export async function syncTasks(tasks) {
  const payload = tasks.map((t) => ({
    ...t,
    updated_at: new Date().toISOString(),
  }));
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  };
  const socketId = getSocketId();
  if (socketId) headers['X-Socket-Id'] = socketId;

  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tasks: payload }),
  });
  if (!res.ok) {
    console.error('Failed to sync tasks:', res.status);
  }
}

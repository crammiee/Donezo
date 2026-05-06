import { API_BASE } from '../config.js';
import { getToken } from './auth-service.js';
import { socketService } from './socket-service.js';

class TaskApiService {
  async syncTasks(tasks) {
    const payload = tasks.map((t) => ({ ...t, updated_at: t.updated_at || new Date().toISOString() }));
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({ tasks: payload }),
    });
    const data = res.ok ? await res.json() : null;
    return { ok: res.ok, status: res.status, data };
  }

  buildHeaders() {
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
    const socketId = socketService.getSocketId();
    if (socketId) headers['X-Socket-Id'] = socketId;
    return headers;
  }
}

export const taskApiService = new TaskApiService();

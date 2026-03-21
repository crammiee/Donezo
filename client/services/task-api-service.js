import { API_BASE } from '../config.js';
import { getToken } from './auth-service.js';
import { socketService } from './socket-service.js';
import { showToast } from '../components/toast/toast.js';

class TaskApiService {
  constructor() {
    this.retryTimer = null;
  }

  async syncTasks(tasks) {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({ tasks: tasks.map((t) => ({ ...t, updated_at: t.updated_at || new Date().toISOString() })) }),
      });
      if (res.status === 429) { this.handleRateLimit(res); }
      else if (!res.ok) console.error('Failed to sync tasks:', res.status);
    } catch (err) {
      if (err instanceof TypeError) return;
      console.error('syncTasks error:', err);
    }
  }

  async handleRateLimit(res) {
    const { error } = await res.json();
    showToast(error);
    this.scheduleRetry();
  }

  scheduleRetry() {
    if (this.retryTimer) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      const raw = localStorage.getItem('donezo_tasks');
      const tasks = raw ? JSON.parse(raw) : [];
      const pending = tasks.filter((t) => !t.synced && !t.is_deleted);
      if (pending.length > 0) this.syncTasks(pending);
    }, 10000);
  }

  buildHeaders() {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
    const socketId = socketService.getSocketId();
    if (socketId) headers['X-Socket-Id'] = socketId;
    return headers;
  }
}

export const taskApiService = new TaskApiService();

import { API_BASE } from '../config.js';
import { getToken } from './auth-service.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.lastSyncTime = null;
    this.onTasksUpdated = null;
  }

  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  connect(onTasksUpdated) {
    if (this.socket) return;
    this.onTasksUpdated = onTasksUpdated;
    this.socket = io(API_BASE);
    this.socket.on('connect', () => this.handleConnect());
    this.socket.on('tasks:updated', (tasks) => this.handleTasksUpdated(tasks));
  }

  handleConnect() {
    this.socket.emit('join', getToken());
    if (this.lastSyncTime) this.fetchDelta();
    this.lastSyncTime = new Date().toISOString();
  }

  handleTasksUpdated(tasks) {
    this.lastSyncTime = this.extractMaxTimestamp(tasks);
    this.onTasksUpdated?.(tasks);
  }

  async fetchDelta() {
    try {
      const res = await fetch(`${API_BASE}/tasks?since=${this.lastSyncTime}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) return;
      const { tasks } = await res.json();
      if (tasks.length > 0) {
        this.lastSyncTime = this.extractMaxTimestamp(tasks);
        this.onTasksUpdated?.(tasks);
      }
    } catch { /* offline/fail retry on reconnect */ }
  }

  extractMaxTimestamp(tasks) {
    if (tasks.length === 0) return this.lastSyncTime;
    return tasks.reduce((max, t) => (t.updated_at > max ? t.updated_at : max), this.lastSyncTime);
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();

import { API_BASE } from '../config.js';
import { getToken } from './auth-service.js';

class SocketService {
  constructor() {
    this.socket = null;
  }

  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  connect(onTasksUpdated) {
    if (this.socket) return;
    this.socket = io(API_BASE);
    this.socket.on('connect', () => this.socket.emit('join', getToken()));
    this.socket.on('tasks:updated', (tasks) => onTasksUpdated(tasks));
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();

import { API_BASE } from '../config.js';
import { getToken } from './auth-service.js';

let socket = null;

export function getSocketId() {
  return socket ? socket.id : null;
}

export function connectSocket(onTasksUpdated) {
  if (socket) return;

  socket = io(API_BASE);

  socket.on('connect', () => {
    socket.emit('join', getToken());
  });

  socket.on('tasks:updated', (tasks) => {
    onTasksUpdated(tasks);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected, will auto-reconnect');
  });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

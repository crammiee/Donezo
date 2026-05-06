import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: process.env.ALLOWED_ORIGIN || '*' } });

  io.on('connection', (socket) => {
    socket.on('join', (token) => {
      try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);
        socket.join(userId);
        socket.userId = userId;
      } catch {
        socket.emit('error', 'Invalid token');
      }
    });
  });
}

export function broadcastTaskEvent(userId, event, payload, excludeSocketId) {
  if (!io) return;
  if (excludeSocketId) {
    io.to(userId).except(excludeSocketId).emit(event, payload);
  } else {
    io.to(userId).emit(event, payload);
  }
}

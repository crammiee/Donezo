import { Server } from 'socket.io';

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(userId);
    });
  });
}

export function broadcastTaskEvent(userId, event, payload) {
  if (io) io.to(userId).emit(event, payload);
}

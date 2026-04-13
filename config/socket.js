const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join', (room) => {
      socket.join(room);
      console.log(`Client ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const emitAttendanceUpdate = (io, data) => {
  io.emit('attendance_update', data);
};

const emitPerformanceUpdate = (io, data) => {
  io.emit('performance_update', data);
};

const emitNotification = (io, data) => {
  io.emit('notification', data);
};

module.exports = { initSocket, emitAttendanceUpdate, emitPerformanceUpdate, emitNotification };

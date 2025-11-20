// Socket.io server configuration
const { Server } = require('socket.io');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('New socket connected:', socket.id);

    socket.on('chatMessage', (msg) => {
      // Broadcast to all clients for now
      io.emit('chatMessage', msg);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}

module.exports = initSocket;

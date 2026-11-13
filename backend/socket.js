const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

// Each logged-in user joins a private room named after their userId,
// so an event can be pushed to every tab that user has open.
function initSocket(server, corsOptions) {
  io = new Server(server, { cors: corsOptions });

  // Only accept sockets that send a valid login token.
  io.use((socket, next) => {
    try {
      socket.user = jwt.verify(socket.handshake.auth.token, process.env.SECRET_KEY);
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(socket.user.userId);
  });
}

// Send a socket message to a list of users.
function sendToUsers(userIds, eventName, payload) {
  if (io && userIds.length) {
    io.to(userIds).emit(eventName, payload);
  }
}

module.exports = { initSocket, sendToUsers };

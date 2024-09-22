const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require('cors');

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for demonstration purposes
  },
});

let connectedUsers = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("login", (email) => {
    connectedUsers[socket.id] = email;
    console.log(`User logged in: ${email} with socket ID: ${socket.id}`);
    io.emit("online_users", Object.values(connectedUsers).map((email, index) => ({ email, id: Object.keys(connectedUsers)[index] })));
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete connectedUsers[socket.id];
    io.emit("online_users", Object.values(connectedUsers).map((email, index) => ({ email, id: Object.keys(connectedUsers)[index] })));
  });

  socket.on("new_event", (eventData) => {
    io.emit("new_event", eventData);

    eventData.participants.forEach((participantEmail) => {
      const participantSocketId = Object.keys(connectedUsers).find(
        (socketId) => connectedUsers[socketId] === participantEmail
      );
      if (participantSocketId) {
        socket.to(participantSocketId).emit("event_invitation", eventData);
      }
    });
  });
});

server.listen(3005, () => {
  console.log("Server is running on port: 3005");
});
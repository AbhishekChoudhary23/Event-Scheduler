const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { Client } = require('pg');
const {queryFn} = require('./utils/queryFunction');

const userRoutes = require('./routers/user.router');
const eventRoutes = require('./routers/event.router');

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

// -----------------------------    Middleware to parse JSON bodies     -----------------------------

app.use(bodyParser.json());
app.use(cors());

// -----------------------------    Using User Routers     -----------------------------
app.use('/user', userRoutes);
app.use('/event', eventRoutes);

// -----------------------------    Socket.IO Setup     -----------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  },
});

let connectedUsers = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('login', (email) => {
    connectedUsers[socket.id] = email;
    console.log(`User logged in: ${email} with socket ID: ${socket.id}`);
    io.emit('online_users', Object.values(connectedUsers).map((email, index) => ({ email, id: Object.keys(connectedUsers)[index] })));
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete connectedUsers[socket.id];
    io.emit('online_users', Object.values(connectedUsers).map((email, index) => ({ email, id: Object.keys(connectedUsers)[index] })));
  });
});

// -----------------------------    Notification Send Functionality     -----------------------------
async function handleNewEventNotification(payload) {
  const eventData = JSON.parse(payload);
  const userData = await queryFn('SELECT email, firstname FROM users WHERE userid = $1', [eventData.createdby]);
  const newEventData = {
    ...eventData,
    startDateTime: eventData.startdatetime,
    endDateTime: eventData.enddatetime,
    createdBy: {
      email: userData.rows[0].email,
      firstname: userData.rows[0].firstname,
    },
  };

  const participantData = await queryFn('SELECT userid FROM participants WHERE eventid = $1', [eventData.eventid]);

  const participantEmails = await queryFn('SELECT email FROM users WHERE userid = ANY($1)', [participantData.rows.map(participant => participant.userid)]);

  participantEmails.rows.forEach((participant) => {
    const participantSocketId = Object.keys(connectedUsers).find((socketId) => connectedUsers[socketId] === participant.email);
    if (participantSocketId) {
      io.to(participantSocketId).emit('event_invitation', newEventData);
    }
  });
  io.emit("new_event", newEventData)
}

// -----------------------------    Listen for PostgreSQL Notifications     -----------------------------
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE || 'eventscheduler',
});

client.connect();

client.query('LISTEN new_event');

client.on('notification', (msg) => {
  if (msg.channel === 'new_event') {
    handleNewEventNotification(msg.payload);
  }
});

// -----------------------------    Start the Server     -----------------------------
server.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
  console.log("CURRENT CONFIG CAPTURED:", process.env.DB_HOST, process.env.DB_PORT)
  console.log({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT,
});;
});
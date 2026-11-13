require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

const userRoutes = require('./routers/user.router');
const eventRoutes = require('./routers/event.router');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 3000;
const corsOptions = { origin: process.env.FRONTEND_URL || 'http://localhost:5173' };

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

app.use('/user', userRoutes);
app.use('/event', eventRoutes);

app.use((req, res) => res.status(404).json({ statusCode: 404, message: 'Route not found' }));
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server, corsOptions);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

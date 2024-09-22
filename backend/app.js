const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const userRoutes = require('./routers/user.router');
const eventRoutes = require('./routers/event.router');
const app = express();
const PORT = process.env.PORT || 5000;
// app.use(compression)

// -----------------------------    Middleware to parse JSON bodies     -----------------------------

app.use(bodyParser.json());
app.use(cors());

// -----------------------------    Using User Routers     -----------------------------
app.use('/user', userRoutes)
app.use('/event', eventRoutes)


app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});

const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const getEvents = require('../controllers/eventController/getEvent.controller')
const createEvent = require('../controllers/eventController/createEvent.controller')


router.post("/create", authenticateToken, createEvent); 
router.get("/", authenticateToken, getEvents); 

module.exports = router;
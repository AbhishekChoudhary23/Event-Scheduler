const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authenticateToken = require('../middleware/authMiddleware');
const getEvents = require('../controllers/eventController/getEvent.controller');
const createEvent = require('../controllers/eventController/createEvent.controller');
const updateEvent = require('../controllers/eventController/updateEvent.controller');
const deleteEvent = require('../controllers/eventController/deleteEvent.controller');

const router = express.Router();

router.use(authenticateToken);
router.get('/', asyncHandler(getEvents));
router.post('/create', asyncHandler(createEvent));
router.put('/:eventId', asyncHandler(updateEvent));
router.delete('/:eventId', asyncHandler(deleteEvent));

module.exports = router;

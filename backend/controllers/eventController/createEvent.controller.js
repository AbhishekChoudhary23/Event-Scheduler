const { randomUUID } = require('crypto');
const { pool } = require('../../database/connection');
const { sendToUsers } = require('../../socket');
const customResponse = require('../../utils/customResponse');
const { readEventInput, buildEvent } = require('./eventHelpers');

async function createEvent(req, res) {
  const creator = req.user;
  const input = await readEventInput(req.body, creator);

  // Save the event and its participants together: both succeed or neither does.
  const eventId = randomUUID();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      'INSERT INTO events (eventId, title, description, startDateTime, endDateTime, createdBy) VALUES (?, ?, ?, ?, ?, ?)',
      [eventId, input.title, input.description, input.start, input.end, creator.userId]
    );
    if (input.invited.length) {
      await connection.query('INSERT INTO participants (eventId, userId) VALUES ?', [
        input.invited.map((user) => [eventId, user.userId]),
      ]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const event = buildEvent(eventId, input, creator);

  // Live updates: the creator's other tabs get the event, invited users get an invitation.
  sendToUsers([creator.userId], 'new_event', event);
  sendToUsers(input.invited.map((user) => user.userId), 'event_invitation', event);

  return customResponse(res, 201, 'Event created', event);
}

module.exports = createEvent;

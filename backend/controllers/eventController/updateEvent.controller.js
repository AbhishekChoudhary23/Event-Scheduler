const { pool } = require('../../database/connection');
const { sendToUsers } = require('../../socket');
const customResponse = require('../../utils/customResponse');
const { readEventInput, buildEvent, findOwnEvent } = require('./eventHelpers');

async function updateEvent(req, res) {
  const creator = req.user;
  const { eventId } = req.params;

  const { participantIds: oldIds } = await findOwnEvent(eventId, creator.userId);
  const input = await readEventInput(req.body, creator);
  const newIds = input.invited.map((user) => user.userId);

  // Update the event and replace its participant list in one transaction.
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      'UPDATE events SET title = ?, description = ?, startDateTime = ?, endDateTime = ? WHERE eventId = ?',
      [input.title, input.description, input.start, input.end, eventId]
    );
    await connection.query('DELETE FROM participants WHERE eventId = ?', [eventId]);
    if (newIds.length) {
      await connection.query('INSERT INTO participants (eventId, userId) VALUES ?', [
        newIds.map((userId) => [eventId, userId]),
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

  // Tell everyone involved what changed for them.
  const stillInvited = newIds.filter((userId) => oldIds.includes(userId));
  const newlyInvited = newIds.filter((userId) => !oldIds.includes(userId));
  const removed = oldIds.filter((userId) => !newIds.includes(userId));

  sendToUsers([creator.userId, ...stillInvited], 'event_updated', event);
  sendToUsers(newlyInvited, 'event_invitation', event);
  sendToUsers(removed, 'event_deleted', {
    eventId,
    message: `${creator.firstName} removed you from ${event.title}`,
  });

  return customResponse(res, 200, 'Changes saved', event);
}

module.exports = updateEvent;

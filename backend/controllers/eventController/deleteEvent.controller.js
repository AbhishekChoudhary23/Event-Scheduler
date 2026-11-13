const { query } = require('../../database/connection');
const { sendToUsers } = require('../../socket');
const customResponse = require('../../utils/customResponse');
const { findOwnEvent } = require('./eventHelpers');

async function deleteEvent(req, res) {
  const creator = req.user;
  const { eventId } = req.params;

  const { event, participantIds } = await findOwnEvent(eventId, creator.userId);

  // Soft delete: the row stays in the table, but no query returns it any more.
  await query('UPDATE events SET deletedAt = UTC_TIMESTAMP() WHERE eventId = ?', [eventId]);

  // Remove it from the creator's other tabs and from every invited user's calendar.
  sendToUsers([creator.userId], 'event_deleted', { eventId });
  sendToUsers(participantIds, 'event_deleted', {
    eventId,
    message: `${creator.firstName} cancelled ${event.title}`,
  });

  return customResponse(res, 200, 'Event deleted', { eventId });
}

module.exports = deleteEvent;

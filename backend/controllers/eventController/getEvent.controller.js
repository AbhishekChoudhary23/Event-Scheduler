const { query } = require('../../database/connection');
const customResponse = require('../../utils/customResponse');

// Events the user created or was invited to, with the creator and the invited emails.
const GET_EVENTS = `
  SELECT
    e.eventId, e.title, e.description, e.startDateTime, e.endDateTime,
    u.userId, u.email, u.firstName,
    (SELECT GROUP_CONCAT(pu.email)
       FROM participants p
       JOIN users pu ON pu.userId = p.userId
      WHERE p.eventId = e.eventId) AS participants
  FROM events e
  JOIN users u ON u.userId = e.createdBy
  WHERE e.isArchived = FALSE
    AND e.deletedAt IS NULL
    AND (
      e.createdBy = ?
      OR EXISTS (SELECT 1 FROM participants p WHERE p.eventId = e.eventId AND p.userId = ?)
    )
  ORDER BY e.startDateTime`;

async function getEvents(req, res) {
  const { userId } = req.user;
  const rows = await query(GET_EVENTS, [userId, userId]);

  const events = rows.map((row) => ({
    eventId: row.eventId,
    title: row.title,
    description: row.description,
    startDateTime: row.startDateTime,
    endDateTime: row.endDateTime,
    createdBy: { userId: row.userId, email: row.email, firstName: row.firstName },
    participants: row.participants ? row.participants.split(',') : [],
  }));

  return customResponse(res, 200, 'Events loaded', events);
}

module.exports = getEvents;

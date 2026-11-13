// Shared by the create, update and delete event controllers.
const { query } = require('../../database/connection');
const CustomError = require('../../utils/CustomError');

// Trim, lowercase and de-duplicate the invited emails. The creator can't invite themself.
function cleanEmails(participants, creatorEmail) {
  if (!Array.isArray(participants)) return [];
  const emails = participants.map((email) => String(email).trim().toLowerCase()).filter(Boolean);
  return [...new Set(emails)].filter((email) => email !== creatorEmail);
}

// Checks the request body of create/update and returns clean values.
// `invited` is the list of invited users: [{ userId, email }].
async function readEventInput(body, creator) {
  const title = body.title?.trim();
  const description = body.description?.trim() || null;
  const start = new Date(body.startDateTime);
  const end = new Date(body.endDateTime);

  if (!title) {
    throw new CustomError('Give the event a title', 400);
  }
  if (isNaN(start) || isNaN(end)) {
    throw new CustomError('Pick a start and an end time', 400);
  }
  if (end < start) {
    throw new CustomError('The event ends before it starts', 400);
  }

  // Every invited email must belong to a registered user.
  const emails = cleanEmails(body.participants, creator.email);
  const invited = emails.length
    ? await query('SELECT userId, email FROM users WHERE email IN (?)', [emails])
    : [];

  const foundEmails = invited.map((user) => user.email);
  const missing = emails.filter((email) => !foundEmails.includes(email));
  if (missing.length) {
    throw new CustomError(`No account found for: ${missing.join(', ')}`, 404);
  }

  return { title, description, start, end, invited };
}

// The event in the shape the frontend expects.
function buildEvent(eventId, { title, description, start, end, invited }, creator) {
  return {
    eventId,
    title,
    description,
    startDateTime: start,
    endDateTime: end,
    createdBy: { userId: creator.userId, email: creator.email, firstName: creator.firstName },
    participants: invited.map((user) => user.email),
  };
}

// Only the creator may change or delete an event.
// Returns the event row and the ids of the users invited to it.
async function findOwnEvent(eventId, userId) {
  const [event] = await query(
    'SELECT eventId, title, createdBy FROM events WHERE eventId = ? AND deletedAt IS NULL AND isArchived = FALSE',
    [eventId]
  );

  if (!event) {
    throw new CustomError('This event no longer exists', 404);
  }
  if (event.createdBy !== userId) {
    throw new CustomError('Only the person who created an event can change it', 403);
  }

  const participants = await query('SELECT userId FROM participants WHERE eventId = ?', [eventId]);
  return { event, participantIds: participants.map((row) => row.userId) };
}

module.exports = { readEventInput, buildEvent, findOwnEvent };

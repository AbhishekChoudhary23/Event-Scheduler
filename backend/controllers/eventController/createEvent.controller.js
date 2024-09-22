const queryFn = require("../../utils/queryFunction");

const _createEvent = `
    INSERT INTO
      EVENTS (
        TITLE,
        DESCRIPTION,
        STARTDATETIME,
        ENDDATETIME,
        CREATEDBY
      )
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING
      *`

const _participant = `
    SELECT
      USERID
    FROM
      USERS
    WHERE
      EMAIL = $1`;

const _addParticipant = `
    INSERT INTO
      PARTICIPANTS (EVENTID, USERID)
    VALUES
      ($1, $2)`;

async function createEvent(req, res) {
  const { title, description, startDateTime, endDateTime, participants } =
    req.body;
  const { userid } = req.user;
  console.log(userid);

  if (!title || !description || !startDateTime || !endDateTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const values = [title, description, startDateTime, endDateTime, userid];
    const eventResult = await queryFn(_createEvent, values);
    const eventId = eventResult.rows[0].eventid;

    const participantQueries = participants.map(async (email) => {
      const userResult = await queryFn(_participant, [email]);
      const userId = userResult.rows[0].userid;

      if (!userId) {
        throw new Error(`User with email ${email} not found`);
      }

      await queryFn(_addParticipant, [eventId, userId]);
    });

    await Promise.all(participantQueries);

    res.status(201).json({ message: "Event created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create event" });
  }
}

module.exports = createEvent;

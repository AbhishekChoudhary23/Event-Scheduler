const {queryFn} = require("../../utils/queryFunction");
const CustomError = require("../../utils/CustomError");
const tryCatchFunction = require("../../utils/tryCatchFunction");

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
    *`;

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

const _getUserInfo = `
  SELECT
    EMAIL,
    FIRSTNAME
  FROM
    USERS
  WHERE
    USERID = $1`;

async function createEvent(req, res) {
  const { title, description, startDateTime, endDateTime, participants } =
    req.body;
  const { userid } = req.user;

  const createEventOperation = async () => {
    if (!title || !description || !startDateTime || !endDateTime) {
      throw new CustomError([{ message: "Missing required fields" }], 400);
    }

    const values = [title, description, startDateTime, endDateTime, userid];
    const eventResult = await queryFn(_createEvent, values);
    const eventId = eventResult.rows[0].eventid;

    const participantQueries = participants.map(async (email) => {
      const userResult = await queryFn(_participant, [email]);
      const userId = userResult.rows[0]?.userid;

      if (!userId) {
        throw new CustomError([{ message: `User with email ${email} not found` }], 404);
      }

      await queryFn(_addParticipant, [eventId, userId]);
    });

    await Promise.all(participantQueries);

    const userInfoResult = await queryFn(_getUserInfo, [userid]);
    const { email, firstname } = userInfoResult.rows[0];

    return {
      event: {
        title,
        description,
        startDateTime,
        endDateTime,
        createdBy: {
          userid,
          email,
          firstname
        }
      }
    };
  };

  tryCatchFunction(createEventOperation, res, "Event created successfully", "Failed to create event");
}

module.exports = createEvent;
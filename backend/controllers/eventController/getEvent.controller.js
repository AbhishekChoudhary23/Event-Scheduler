const {queryFn} = require("../../utils/queryFunction");
const tryCatchFunction = require("../../utils/tryCatchFunction");

const _getEvents = `
  SELECT 
    e.eventid, 
    e.title, 
    e.description, 
    e.startdatetime, 
    e.enddatetime, 
    e.createdby, 
    u.email AS creator_email, 
    u.firstname AS creator_firstname
  FROM events e
  JOIN users u ON e.createdby = u.userid
  WHERE e.createdby = $1 OR e.eventid IN (
    SELECT p.eventid
    FROM participants p
    WHERE p.userid = $1
  ) AND e.isarchived = FALSE AND e.deletedat IS NULL
`;

async function getEvents(req, res) {
  const { userid } = req.user;

  const retrieveEvents = async () => {
    const values = [userid];
    const eventResult = await queryFn(_getEvents, values);

    return eventResult.rows.map((event) => {
      const { eventid, title, description, startdatetime, enddatetime, createdby, creator_email, creator_firstname } = event;
      return {
        eventid,
        title,
        description,
        startDateTime: startdatetime,
        endDateTime: enddatetime,
        createdBy: {
          userid: createdby,
          email: creator_email,
          firstname: creator_firstname,
        },
      };
    });
  };

  tryCatchFunction(retrieveEvents, res, "Events retrieved successfully", "Failed to retrieve events"); 
}

module.exports = getEvents;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users(
    userId uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    firstName VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
	createdAt timestamp NOT NULL default current_timestamp,
	updatedAt timestamp NOT NULL default current_timestamp,
	isArchived bool default false
);

CREATE TABLE events (
  eventId uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  startDateTime TIMESTAMP NOT NULL,
  endDateTime TIMESTAMP NOT NULL,
  createdBy uuid NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP,
  isArchived BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (createdBy) REFERENCES users(userId),
  CHECK (startDateTime <= endDateTime)
);

CREATE TABLE participants (
  participantId uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  eventId uuid NOT NULL,
  userId uuid NOT NULL,
  FOREIGN KEY (eventId) REFERENCES events(eventId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE OR REPLACE FUNCTION notify_new_event()
  RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('new_event', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_new_event_trigger
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE PROCEDURE notify_new_event();

SELECT * FROM users;
SELECT * FROM events;
SELECT * FROM participants;
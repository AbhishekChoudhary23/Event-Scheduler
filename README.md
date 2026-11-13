# Event Scheduler

A shared calendar. You create an event, invite people by email, and the event
appears on their calendar the moment you save it. No page refresh needed.

- `backend/` is an Express API with MySQL and Socket.IO
- `frontend/` is a React app built with Vite

## How it works

### The big picture

```
┌──────────────────┐   HTTP (JSON + JWT)    ┌──────────────────┐        ┌─────────┐
│  React frontend  │ ─────────────────────▶ │  Express backend │ ─────▶ │  MySQL  │
│  localhost:5173  │ ◀───────────────────── │  localhost:3000  │ ◀───── │         │
└──────────────────┘   Socket.IO (live)     └──────────────────┘        └─────────┘
```

The frontend talks to the backend in two ways:

1. **HTTP requests** for things the user asks for: sign up, log in, load events,
   create an event.
2. **A Socket.IO connection** for things the server pushes: "someone invited
   you to an event".

### Signing up and logging in

1. Signup sends `firstName`, `email` and `password` to `POST /user/signup`.
   The backend hashes the password with bcrypt and stores the user.
2. Login sends `email` and `password` to `POST /user/login`. If they match, the
   backend returns the user and a **JWT token** that is valid for
   `EXPIRATION_TIME` (1 hour by default).
3. The frontend saves the token and the user in `localStorage`
   (`frontend/src/utils/auth.js`).
4. Every later request sends the token in the `Authorization: Bearer <token>`
   header. `backend/middleware/authMiddleware.js` checks it and puts the user on
   `req.user`.
5. When the token expires, the backend answers `401`. The frontend clears the
   session and returns to the login page.

### Loading the calendar

1. `CalendarPage` calls `GET /event`.
2. The backend returns every event the user **created** or **was invited to**,
   with the creator and the list of invited emails.
3. The frontend builds the 42 days of the visible month (6 weeks) and groups
   the events by day (`frontend/src/utils/calendar.js`). An event that spans
   several days appears on each of those days.
4. `MonthGrid` draws the month. `DayAgenda` lists the events of the selected day.

Green chips are events you created. Purple chips are events you were invited to.

### Creating an event

1. The "New event" dialog sends `title`, `description`, `startDateTime`,
   `endDateTime` and `participants` (a list of emails) to `POST /event/create`.
2. The backend checks the input: a title is required, the end can't be before
   the start, and every invited email must belong to a registered user.
3. The event and its participants are saved inside **one transaction**, so
   either both are saved or neither is.
4. The backend answers with the new event, and the creator's calendar shows it.

### Editing and deleting an event

Only the person who created an event can change it. Their events show **Edit**
and **Delete** buttons in the day agenda.

- **Edit** opens the same dialog, filled in, and sends the form to
  `PUT /event/:eventId`. The backend updates the event and replaces its
  participant list in one transaction.
- **Delete** asks once more, then calls `DELETE /event/:eventId`. This is a
  **soft delete**: the row stays in the table with `deletedAt` filled in, and no
  query returns it any more.

Anyone else who tries gets `403`. A deleted event answers `404`.

### Live updates

1. After login the frontend opens one socket and sends the JWT token with it
   (`frontend/src/utils/socket.js`).
2. The backend verifies the token and puts the socket in a private **room**
   named after the user's id (`backend/socket.js`).
3. The backend sends each person only what changed for them:

   | Socket message | Sent when | Sent to |
   | --- | --- | --- |
   | `new_event` | An event is created | The creator (their other open tabs) |
   | `event_invitation` | Someone is invited, at creation or by a later edit | The invited user |
   | `event_updated` | An event is edited | The creator and everyone still invited |
   | `event_deleted` | An event is deleted, or an edit removes someone | The creator and the affected users |

4. The calendar adds, replaces or removes the event and shows a toast message,
   for example "Ravi updated Retro" or "Ravi cancelled Retro".

Events are only sent to the people involved. Nobody else receives them.

### Notifications

An invitation shows a toast inside the page **and** a browser notification (the
system pop-up), so it is noticed even when the calendar tab is in the background.

- The header shows a **Turn on notifications** button until the user answers
  the browser's permission prompt.
- The code is in `frontend/src/utils/notifications.js` and uses the browser's
  Notification API.
- The notification is triggered by the socket message, so it needs the app to
  be open in a tab. It does not arrive when the browser or the tab is closed.

### Dates and time zones

Dates are stored in MySQL as UTC and travel through the API as ISO strings
(`2026-11-13T10:00:00.000Z`). The browser converts them to the user's local
time when showing them.

### Errors

Controllers throw a `CustomError(message, status)`. The `asyncHandler` wrapper
passes it to `backend/middleware/errorHandler.js`, which turns it into the
standard response. Every response, success or error, has the same shape:

```json
{ "statusCode": 201, "message": "Event created", "data": { } }
```

## Database

Three tables, defined in `backend/database/schema.sql`:

| Table | Holds | Key columns |
| --- | --- | --- |
| `users` | Accounts | `userId`, `firstName`, `email`, `password` (hashed) |
| `events` | Events | `eventId`, `title`, `description`, `startDateTime`, `endDateTime`, `createdBy`, `updatedAt`, `deletedAt` |
| `participants` | Who is invited to what | `eventId`, `userId` |

Ids are UUIDs generated by the backend. `events.updatedAt` is set by MySQL on
every edit. `events.deletedAt` is `NULL` for a live event and holds the time of
deletion otherwise.

## API

| Method | Path | Needs token | Body |
| --- | --- | --- | --- |
| POST | `/user/signup` | No | `firstName`, `email`, `password` (6+ characters) |
| POST | `/user/login` | No | `email`, `password` |
| GET | `/event` | Yes | none |
| POST | `/event/create` | Yes | `title`, `description`, `startDateTime`, `endDateTime`, `participants` |
| PUT | `/event/:eventId` | Yes, creator only | Same as create |
| DELETE | `/event/:eventId` | Yes, creator only | none |

## Project structure

```
backend/
  app.js                  Starts Express and Socket.IO
  socket.js               Socket rooms and sending live events
  database/
    connection.js         MySQL connection pool and the query() helper
    schema.sql            Table definitions
    setup.js              Creates the database and tables
  routers/                Maps URLs to controllers
  controllers/            Signup, login, list / create / update / delete events
  middleware/             Token check and error handler
  service/                Creates JWT tokens
  utils/                  CustomError, asyncHandler, response and bcrypt helpers

frontend/src/
  App.jsx                 Routes: / (login), /signup, /home (calendar)
  Pages/                  Login, Signup, CalendarPage
  Components/             Header, MonthGrid, DayAgenda, EventDialog, Toast, AuthLayout
  Route/ProtectedRoute    Sends logged-out users back to the login page
  utils/                  api, auth (session), socket, notifications, calendar helpers
  styles/                 index.css (shared), auth.css, calendar.css
```

## Setup

You need **Node.js 18 or newer** and a running **MySQL 8** server.

### 1. Backend

```bash
cd backend
```

```bash
npm install
```

Create the env file from the example:

```bash
cp .env.example .env
```

Open `backend/.env` and fill it in:

| Variable | Meaning | Example |
| --- | --- | --- |
| `PORT` | Port the backend runs on | `3000` |
| `FRONTEND_URL` | Address of the frontend (for CORS) | `http://localhost:5173` |
| `SECRET_KEY` | Any long random string, used to sign tokens | |
| `EXPIRATION_TIME` | How long a login lasts | `1h` |
| `SALT_ROUNDS` | bcrypt strength | `10` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | Password of that MySQL user | |
| `DB_NAME` | Database name (`eventscheduler` if left empty) | `eventscheduler` |

Create the database and its tables. Safe to run more than once, and it also
upgrades an older database (it adds `events.updatedAt` if missing):

```bash
npm run db:setup
```

Start the backend:

```bash
npm run dev
```

It prints `Server is running on port 3000`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
```

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173.

`frontend/.env` holds `VITE_API_URL`, the address of the backend. Change it
only if the backend does not run on `http://localhost:3000`.

### 3. Try it

1. Create two accounts (use a second browser or a private window for the second).
2. Log in with both.
3. With the first account, create an event and invite the second account's email.
4. The event appears on the second account's calendar right away.
5. Edit or delete the event with the first account. The second calendar follows.

### Troubleshooting

| Problem | Fix |
| --- | --- |
| `Access denied for user 'root'@'localhost'` | `DB_USER` or `DB_PASSWORD` in `backend/.env` is wrong |
| `Unknown database` | Run `npm run db:setup` in `backend/` |
| `ECONNREFUSED ...:3306` | MySQL is not running, or `DB_PORT` is wrong |
| "Can't reach the server" in the browser | Backend is not running, or `VITE_API_URL` points to the wrong address |
| CORS error in the browser console | `FRONTEND_URL` in `backend/.env` must match the frontend address exactly |
| `EADDRINUSE` | Another program uses the port. Change `PORT` (and `VITE_API_URL` to match) |

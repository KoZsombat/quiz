# QuizParty

[![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20TypeScript-61dafb?style=flat-square)](client)
[![Backend](https://img.shields.io/badge/backend-Express%205%20%2B%20MySQL-3c873a?style=flat-square)](server)
[![Realtime](https://img.shields.io/badge/realtime-Socket.IO-010101?style=flat-square)](server/src/quiz_socket.js)

A live quiz app in the Kahoot mould. Write a quiz, start a session, and share the link — players join on their own devices, answer against a countdown, and watch the scoreboard shuffle after every question.

## What it does

- Lets you build quizzes with as many questions as you like, each with its own options, correct answer, per-question timer, and an optional image
- Marks quizzes public or private, so you choose whether they show up for everyone
- Runs sessions in Socket.IO rooms: a host screen to drive the quiz, a broadcast screen for the projector, and a join page for players
- Shows the live player count while people are joining and a live scoreboard once the questions start
- Gives you a dashboard of the quizzes you've written, to edit or delete
- Signs you up and in with bcrypt-hashed passwords and JWT

Each session gets its own generated join URL, so the same quiz can be run again later without the old link still working.

## Running it locally

You'll need Node 20+ and MySQL 8 or MariaDB 10+.

```bash
git clone https://github.com/KoZsombat/quiz
cd quiz

# install both sides
cd client && npm install
cd ../server && npm install

# create the database, then import the schema
cd ..
mysql -u root -p -e "CREATE DATABASE quiz"
mysql -u root -p quiz < server/quiz.sql
```

Both halves ship an annotated `.env.example`, so copy each one and fill it in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

On the server side the ones that matter are your MySQL connection (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), a long random `JWT_SECRET`, and `CORS_ORIGIN` pointing at the frontend. On the client side, `VITE_API_URL` and `VITE_SOCKET_URL` point at the backend — the defaults already line up if you leave the server on port 3000.

Start both and open the app:

```bash
# in server/
npm start

# in client/
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Under the hood

React 19 + TypeScript with Vite and Tailwind CSS 4 on the front, Express 5 + MySQL on the back, and Socket.IO carrying everything that happens during a live round. Auth is bcrypt plus JWT, with helmet, CORS and rate limiting in front of the API, and question images are uploaded through multer and served back from `server/images`.

The REST endpoints live in `server/src/quiz_express.js`, the live-game logic in `server/src/quiz_socket.js`, and the schema in `server/quiz.sql`. On the client, `src/pages` holds one file per screen and `src/scripts` holds the socket and session hooks.

## License

Built as a portfolio project, provided as-is.

# QuizParty

[![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20TypeScript-61dafb?style=flat-square)](client)
[![Backend](https://img.shields.io/badge/backend-Express%205%20%2B%20MySQL-3c873a?style=flat-square)](server)
[![Realtime](https://img.shields.io/badge/realtime-Socket.IO-010101?style=flat-square)](server/src/quiz_socket.js)

Full-stack real-time quiz application where hosts can create quizzes, start live sessions, and players can join and answer questions with a live scoreboard.

## At a Glance

| Area     | Details                                                    |
| -------- | ---------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4                 |
| Backend  | Express 5, MySQL/MariaDB, Socket.IO                        |
| Realtime | Room-based quiz sessions, live user count, live scoreboard |
| Auth     | Register/login with bcrypt, token-based socket identity    |
| Media    | Optional image upload for quiz questions                   |

## Highlights

- Quiz creation with multiple questions, options, timer, and correct answer
- Public/private quiz visibility
- Real-time host/admin/broadcast/player flow with Socket.IO rooms
- Live scoreboard updates during gameplay
- User registration and login
- Quiz dashboard for listing, editing, and deleting authored quizzes
- Image upload and file serving for quiz content

## Tech Stack

| Frontend           | Backend                                  |
| ------------------ | ---------------------------------------- |
| React 19           | Express 5                                |
| TypeScript 5       | MySQL via mysql2                         |
| Vite 7             | Socket.IO 4                              |
| Tailwind CSS 4     | bcrypt, helmet, cors, express-rate-limit |
| react-router-dom 7 | express-validator, multer, jsonwebtoken  |

## Requirements

- Node.js 20+
- npm
- MySQL 8+ or MariaDB 10+

## Quick Start

```bash
git clone <repo-url>
cd quiz

cd client
npm install
cd ../server
npm install

# import database schema
mysql -u root -p < quiz.sql
```

Create environment files (see Setup), then run backend and frontend.

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd quiz
```

### 2. Install dependencies

```bash
cd client
npm install
cd ../server
npm install
```

### 3. Create database and import schema

Create a database (example name: `quiz`) and import:

```bash
mysql -u root -p < server/quiz.sql
```

### 4. Create environment files

Create `server/.env`:

```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quiz
JWT_SECRET=replace_with_a_long_random_secret
API_URL=http://localhost:3001/api
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
VITE_URL=http://localhost:5173
VITE_GITHUB_URL=https://github.com/<your-profile>
```

### 5. Start backend

From the `server` folder:

```bash
node app.js
```

### 6. Start frontend

From the `client` folder:

```bash
npm run dev
```

### 7. Open the app

`http://localhost:5173`

## Scripts

### Client

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start Vite development server     |
| `npm run build`   | Type-check and build frontend     |
| `npm run preview` | Preview production build          |
| `npm run lint`    | Run ESLint                        |
| `npm run format`  | Format source files with Prettier |

### Server

| Command          | Description                               |
| ---------------- | ----------------------------------------- |
| `npm start`      | Starts Node using configured entry script |
| `npm run eslint` | Run ESLint                                |
| `npm run format` | Format server files with Prettier         |

## Runtime Notes

- Backend listens on `PORT`.
- Frontend reads API base URL from `VITE_API_URL`.
- Socket client connects through `VITE_SOCKET_URL`.
- CORS is restricted to `CORS_ORIGIN`.

## API Overview

Base URL: `/api`

### Auth

| Method | Path        | Description                      |
| ------ | ----------- | -------------------------------- |
| `POST` | `/register` | Register a new user              |
| `POST` | `/login`    | Login with username and password |

### Quiz Management

| Method | Path                   | Description                                |
| ------ | ---------------------- | ------------------------------------------ |
| `POST` | `/saveQuiz`            | Save a new quiz                            |
| `POST` | `/getQuizzes`          | Get public quizzes and own quizzes         |
| `POST` | `/getQuizForEdit`      | Load an authored quiz for editing          |
| `POST` | `/updateQuiz`          | Update an authored quiz                    |
| `POST` | `/deleteQuiz`          | Delete an authored quiz                    |
| `POST` | `/startQuiz`           | Start a quiz session and create share URL  |
| `POST` | `/endQuiz`             | End quiz session                           |
| `POST` | `/getQuiz`             | Get quiz questions from active session URL |
| `POST` | `/getCode`             | Resolve active URL to original quiz code   |
| `POST` | `/isQuizCodeAvailable` | Check whether a session URL is active      |

### User

| Method | Path              | Description           |
| ------ | ----------------- | --------------------- |
| `POST` | `/getUserData`    | Fetch username/email  |
| `POST` | `/updateUserData` | Update username/email |

### Files

| Method | Path               | Description                   |
| ------ | ------------------ | ----------------------------- |
| `POST` | `/upload`          | Upload image for quiz content |
| `POST` | `/delete`          | Delete uploaded image         |
| `GET`  | `/files/:filename` | Serve uploaded image          |

## Socket Events (Core)

- `adminCon`, `verifyAdmin`, `setAdminUsername`
- `joinRoom`, `userCon`, `broadcastCon`
- `startRoom`, `getQuiestions`, `nextTrigger`, `endOfQuiz`
- `correctAns`, `scoreboardUpdate`, `usersUpdate`

## Database

The schema is in `server/quiz.sql`.

Main tables:

- `user`: registered users
- `quizzes`: quiz questions grouped by quiz code
- `active`: active quiz sessions and generated join URLs

## Project Structure

```text
quiz/
|- client/
|  |- src/
|  |  |- components/      # UI components (alerts, scoreboard)
|  |  |- pages/           # Route pages (home, login, create, host, quiz, etc.)
|  |  |- scripts/         # Socket + session helper hooks
|  |  `- types/           # Shared frontend types
|  `- vite.config.ts
|- server/
|  |- src/
|  |  |- db.js            # Database connection
|  |  |- login.js         # Auth endpoints
|  |  |- quiz_express.js  # Quiz REST endpoints
|  |  |- quiz_socket.js   # Socket.IO live quiz logic
|  |  `- file.js          # Image upload/file endpoints
|  |- images/             # Uploaded quiz images
|  |- quiz.sql            # Database schema
|  `- app.js              # Express + Socket.IO entry
`- README.md
```

## Notes

- No automated test suite is configured yet.
- The server package `start` script may require aligning with the actual entry file if you prefer `npm start` over `node app.js`.

## License

Provided as-is for learning and portfolio purposes.

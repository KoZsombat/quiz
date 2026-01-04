import cors from "cors";
import helmet from "helmet";
import http from "http";
import express from "express";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import quizSocketHandler from "./src/quiz_socket.js";
import quizExpressHandler from "./src/quiz_express.js";
import loginHandler from "./src/login.js";
import fileHandler from "./src/file.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const server = http.createServer(app);
const port = process.env.PORT;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  }),
);
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

quizSocketHandler(io);

quizExpressHandler(app);

loginHandler(app);

fileHandler(app);

server.listen(port, () => {
  console.info(`Server running`);
});

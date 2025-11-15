import cors from 'cors';
import helmet from "helmet";
import http from "http";
import express from 'express';
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import quizSocketHandler from "./src/quiz_socket.js";
import quizExpressHandler from "./src/quiz_express.js";
import loginHandler from "./src/login.js";

// jwt token, .env for jwt and db and cors and api ip address on frontend, mobile responsive design
// quiz question time limit

const app = express();

const server = http.createServer(app);
const port = 3000

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}))
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json())

quizSocketHandler(io);

quizExpressHandler(app);

loginHandler(app);

server.listen(port, () => {
  console.log(`Server running`)
})
import cors from 'cors';
import helmet from "helmet";
import http from "http";
import express from 'express';
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import quizSocketHandler from "./src/quiz_socket.js";
import quizExpressHandler from "./src/quiz_express.js";
import loginHandler from "./src/login.js";
import dotenv from "dotenv";
dotenv.config();

// admin ui, broadcast view nem mukodik
// refreshnél elso kerdere dobja a jatekost, admin ui rossz a leader board minden jatekost egybe dob nem clearelodik, nem ad pontot tobb quiznel

const app = express();

const server = http.createServer(app);
const port = 3000

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ["GET", "POST"],
}))
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
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
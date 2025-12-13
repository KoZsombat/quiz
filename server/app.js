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
// ELV JO: nem ad pontot tobb quiznel, 
// minden 2. quiz inditasnal reloadolni kell a hostnak, 
// ELV JO: tobb quiznel ha ugyan az a neve az embernek neki ad pontot es a masiknal nem irja ki az embert (nem tudja ellenőrizni hogy jó ember lép e be ezért kidobja)

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
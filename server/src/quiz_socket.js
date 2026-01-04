import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

function verifyToken(token, socket, io, errorEvent = "joinError") {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { name: decoded.name };
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      io.to(socket.id).emit("tokenExpired");
    } else {
      io.to(socket.id).emit(errorEvent);
    }
    return null;
  }
}

function emitJoinError(socket, io, msg = "joinError") {
  io.to(socket.id).emit(msg);
}

export default function quizSocketHandler(io) {
  const roomList = [];
  const apiUrl = process.env.API_URL;

  io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => {
      if (!data || !data.name || !data.roomId) {
        emitJoinError(socket, io);
        return;
      }
      const verified = verifyToken(data.name, socket, io);
      if (!verified) return;
      const { name } = verified;
      const rIndex = roomList.findIndex((r) => r.roomId === data.roomId);
      if (rIndex === -1) return;
      socket.join(data.roomId);
      if (!roomList[rIndex].users.some((p) => p.username === name)) {
        const user = {
          roomId: data.roomId,
          userId: socket.id,
          username: name,
          score: 0,
        };
        roomList[rIndex].users.push(user);
      } else {
        io.to(socket.id).emit("nameExist");
        return;
      }
      io.to(data.roomId).emit("usersUpdate", {
        count: roomList[rIndex].users.length,
      });
    });

    socket.on("adminCon", (data) => {
      socket.join(data.quizId);
      if (!data.auth) {
        emitJoinError(socket, io);
        return;
      }
      const verified = verifyToken(data.auth, socket, io);
      if (!verified) return;
      const { name } = verified;
      let rIndex = roomList.findIndex((r) => r.roomId === data.quizId);
      if (rIndex === -1) {
        roomList.push({
          roomId: data.quizId,
          isStarted: false,
          globalIndex: 0,
          users: [],
          auth: name,
        });
        rIndex = roomList.length - 1;
      } else if (roomList[rIndex].auth !== name) {
        emitJoinError(socket, io);
        return;
      }
      socket.join(data.quizId);
      io.to(data.quizId).emit("usersUpdate", {
        count: roomList[rIndex].users.length,
      });
      io.to(data.quizId).emit("scoreboardUpdate", roomList[rIndex].users);
    });

    socket.on("setAdminUsername", (data) => {
      const token = jwt.sign(
        { name: data.name, socketId: socket.id },
        process.env.JWT_SECRET,
        { expiresIn: "2h" },
      );
      io.to(socket.id).emit("recieveAdminUsername", token);
    });

    socket.on("setAdminUserBack", (data) => {
      const verified = verifyToken(data.name, socket, io);
      if (!verified) return;
      const { name } = verified;
      io.to(socket.id).emit("recieveAdminUsernameBack", name);
    });

    socket.on("verifyAdmin", (data) => {
      const verified = verifyToken(data.name, socket, io);
      if (!verified) return;
      const { name } = verified;
      io.to(socket.id).emit("adminVerified", name);
    });

    socket.on("broadcastCon", (data) => {
      const rIndex = roomList.findIndex((r) => r.roomId === data.roomId);
      if (rIndex === -1) return;
      if (roomList[rIndex].isStarted)
        socket.emit("broadcastSetIndex", roomList[rIndex].globalIndex);
      socket.join(data.roomId);
    });

    socket.on("userCon", (data) => {
      const rIndex = roomList.findIndex((r) => r.roomId === data.roomId);
      if (rIndex === -1) return;
      const verified = verifyToken(data.name, socket, io);
      if (!verified) return;
      const { name } = verified;
      const alreadyInRoom = roomList[rIndex].users.some(
        (u) => u.username === name,
      );
      if (!alreadyInRoom) {
        const user = {
          roomId: data.roomId,
          userId: socket.id,
          username: name,
          score: 0,
        };
        roomList[rIndex].users.push(user);
        socket.join(data.roomId);
      } else {
        emitJoinError(socket, io);
      }
      io.to(data.roomId).emit("usersUpdate", {
        count: roomList[rIndex].users.length,
      });
    });

    socket.on("setUsername", (data) => {
      const token = jwt.sign(
        { name: data.name, socketId: socket.id },
        process.env.JWT_SECRET,
        { expiresIn: "2h" },
      );
      io.to(socket.id).emit("recieveUsername", token);
    });

    socket.on("startRoom", (roomId) => {
      const rIndex = roomList.findIndex((r) => r.roomId === roomId);
      if (rIndex === -1) return;
      io.to(roomId).emit("startQuiz");
      io.to(roomId).emit("scoreboardUpdate", roomList[rIndex].users);
    });

    socket.on("getQuiestions", async (roomId) => {
      const rIndex = roomList.findIndex((r) => r.roomId === roomId);
      if (rIndex === -1) return;
      socket.join(roomId);
      const response = await fetch(`${apiUrl}/getQuiz/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: roomId }),
      });
      let data;
      try {
        data = await response.json();
      } catch (err) {
        data = { err };
      }
      io.to(roomId).emit("sendQuestions", data);
      io.to(socket.id).emit("setIndex", roomList[rIndex].globalIndex);
    });

    socket.on("correctAns", (data) => {
      const verified = verifyToken(data.username, socket, io);
      if (!verified) return;
      const { name } = verified;
      const rIndex = roomList.findIndex((r) => r.roomId === data.roomId);
      if (rIndex === -1) return;
      const uIndex = roomList[rIndex].users.findIndex(
        (u) => u.username === name,
      );
      if (uIndex !== -1) {
        roomList[rIndex].users[uIndex].score += 1;
      } else {
        console.warn(`User not found in roomList: ${name}`);
      }
      io.to(data.roomId).emit("scoreboardUpdate", roomList[rIndex].users);
    });

    socket.on("nextTrigger", (roomId) => {
      const rIndex = roomList.findIndex((r) => r.roomId === roomId);
      if (rIndex === -1) return;
      roomList[rIndex].globalIndex += 1;
      io.to(roomId).emit("next", roomList[rIndex].globalIndex);
    });

    socket.on("endOfQuiz", (roomId) => {
      const rIndex = roomList.findIndex((r) => r.roomId === roomId);
      if (rIndex !== -1) {
        roomList.splice(rIndex, 1);
      }
    });

    socket.on("disconnect", () => {
      for (const room of roomList) {
        const userIndex = room.users.findIndex(
          (user) => user.userId === socket.id,
        );
        if (userIndex !== -1) {
          const { roomId } = room.users[userIndex];
          room.users.splice(userIndex, 1);
          io.to(roomId).emit("usersUpdate", { count: room.users.length });
          break;
        }
      }
    });
  });
}

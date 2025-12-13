import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default function quizSocketHandler(io) {

  const roomUsers = [];
  const roomList = []

  io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => {
      if (!data || !data.name || !data.roomId) {
        io.to(socket.id).emit("joinError");
        return;
      }

      let name = "";
      try {
        const decoded = jwt.verify(data.name, process.env.JWT_SECRET);
        name = decoded.name;
      } catch (err) {
        console.log("joinRoom token error:", err);
        io.to(socket.id).emit("joinError");
        return;
      }

      if (!roomList.some(r => r.roomId == data.roomId)) return;
      socket.join(data.roomId);
      if (!roomUsers.some(p => p.username === name && p.roomId === data.roomId)) {
        roomUsers.push({ roomId: data.roomId, userId: socket.id, username: name, score: 0 });
        const rIndex = roomList.findIndex(r => r.roomId === data.roomId);
        roomList[rIndex].users.push(name)
      } else {
        io.to(socket.id).emit("nameExist");
      }
      io.to(data.roomId).emit("usersUpdate", { count: roomUsers.filter(user => user.roomId == data.roomId).length || 0 });
    });

    socket.on("adminCon", (data) => {
      socket.join(data.quizId)

      let name = "";
        try {
          const decoded = jwt.verify(data.auth, process.env.JWT_SECRET);
          name = decoded.name;
        } catch (err) {
          console.log("joinRoom token error:", err);
          io.to(socket.id).emit("joinError");
          return;
        }

      if (!data.auth) io.to(socket.id).emit("joinError");
      if (!roomList.some(r => r.roomId == data.quizId)) 
        roomList.push({ roomId: data.quizId, isStarted: false, globalIndex: 0, users: [], auth: name})
      else if (roomList.some(r => r.roomId == data.quizId && r.auth !== name))
        io.to(socket.id).emit("joinError");
      socket.join(data.quizId)
      io.to(data.quizId).emit("usersUpdate", { count: roomUsers.filter(user => user.roomId == data.quizId).length || 0});
      const usersinRoom = roomUsers.filter(user => user.roomId == data.quizId)
      io.to(data.quizId).emit("scoreboardUpdate", (usersinRoom))
    })

    socket.on("broadcastCon", (data) => {
      if (!roomList.some(r => r.roomId == data.roomId)) return
      socket.join(data.roomId)
    })

    socket.on("userCon", (data) => {
      if (!roomList.some(r => r.roomId == data.roomId)) return

      var name = "";

      try {
          const decoded = jwt.verify(data.name, process.env.JWT_SECRET);
          name = decoded.name;
      } catch (err) {return}

      const roomId = data.roomId;

      const alreadyInRoom = roomUsers.some(u => u.username === name && u.roomId === roomId);

      if (!alreadyInRoom) {
        const rIndex = roomList.findIndex(r => r.roomId === roomId);

        try{
          if (roomList[rIndex].users.includes(name)) {
            roomUsers.push({ roomId, userId: socket.id, username: name, score: 0 });
            socket.join(roomId);
          } else {
            io.to(socket.id).emit("joinError");
          }
        } catch (err) {
          if (err) io.to(socket.id).emit("joinError");
        }
      } else {
        io.to(socket.id).emit("joinError");
      }

      io.to(roomId).emit("usersUpdate", { count: roomUsers.filter(user => user.roomId === roomId).length });
    });

    socket.on("setUsername", (data) => {
      const token = jwt.sign(
        { name: data.name },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
      io.to(socket.id).emit("recieveUsername", token);
    })

    socket.on("startRoom", (roomId) => {
      io.to(roomId).emit("startQuiz")
      const usersinRoom = roomUsers.filter(user => user.roomId == roomId)
      io.to(roomId).emit("scoreboardUpdate", (usersinRoom))
    })

    socket.on("getQuiestions", async (roomId) => {
      if (!roomList.some(r => r.roomId == roomId)) return
      socket.join(roomId)
      const response = await fetch(`http://localhost:3000/api/getQuiz/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: roomId }),
      })
      let data;
      try {
        data = await response.json();
      } catch (err) {
        data = { err };
      }
      io.to(roomId).emit("sendQuestions", data)
      console.log("Questions sent to room:", roomId);
      console.log(roomList);
      const rIndex = roomList.findIndex(r => r.roomId === roomId)
      console.log(rIndex);
      io.to(socket.id).emit("setIndex", (roomList[rIndex].globalIndex))
    })

    socket.on("correctAns", (data) => {

      var name = "";

      try {
          const decoded = jwt.verify(data.username, process.env.JWT_SECRET);
          name = decoded.name;
      } catch (err) {return}

      const uIndex = roomUsers.findIndex(u => u.username == name && u.roomId == data.roomId);
      if (uIndex !== -1) {
        roomUsers[uIndex].score += 1;
      } else {
        console.warn(`User not found in roomUsers: ${name}`);
      }
      const usersinRoom = roomUsers.filter(user => user.roomId == roomUsers[uIndex].roomId)
      io.to(roomUsers[uIndex].roomId).emit("scoreboardUpdate", (usersinRoom))
    })

    socket.on("nextTrigger", (roomId) =>{
      const rIndex = roomList.findIndex(r => r.roomId === roomId)
      roomList[rIndex].globalIndex += 1
      io.to(roomId).emit("next", (roomList[rIndex].globalIndex))
    })

    socket.on("endOfQuiz", (roomId) => {
      const rIndex = roomList.findIndex(r => r.roomId === roomId)
      roomList.splice(rIndex)
    })

    socket.on("disconnect", () => {
      const user = roomUsers.findIndex(user => user.userId === socket.id)
      if (user !== -1) {
        const { roomId } = roomUsers[user];
        roomUsers.splice(user);

        io.to(roomId).emit("usersUpdate", { count: roomUsers.filter(user => user.roomId == roomId).length || 0});
      }
    });
  });
}
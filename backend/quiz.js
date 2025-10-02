module.exports = function quizSocketHandler(io) {

  const roomUsers = [];

  io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => {
      socket.join(data.roomId);
      if (!roomUsers.some(p => p.username === data.name && p.roomId === data.roomId)) {
        roomUsers.push({ roomId: data.roomId, userId: socket.id, username: data.name, score: 0 }); //socket id-t nem kell megjegyezni sztem
      } else {
        console.log("dup");
        io.to(socket.id).emit("nameExist");
      }
      io.to(data.roomId).emit("usersUpdate", { count: roomUsers.filter(user => user.roomId == data.roomId).length || 0 });
    });

    socket.on("adminCon", (quizId) => {
      socket.join(quizId)
      io.to(quizId).emit("usersUpdate", { count: roomUsers.filter(user => user.roomId == quizId).length || 0});
    })

    socket.on("userCon", (data) => {
      socket.join(data.roomId);
      if (!roomUsers.some(p => p.username === data.name && p.roomId === data.roomId)) {
        roomUsers.push({ roomId: data.roomId, userId: socket.id, username: data.name, score: 0 });
      } else {
        console.log("dup");
      }
      io.to(data.roomId).emit("usersUpdate", { count: roomUsers.filter(user => user.roomId == data.roomId).length || 0 });
    })

    socket.on("startRoom", (roomId) => {
      io.to(roomId).emit("startQuiz")
      io.to(roomId).emit("scoreboardUpdate", (roomUsers))
    })

    socket.on("getQuiestions", async (roomId) => {
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
        const text = await response.text();
        data = { error: text };
      }
      io.to(roomId).emit("sendQuestions", data)
    })

    socket.on("correctAns", (username) => {
      const uIndex = roomUsers.findIndex(u => u.username == username)
      if (uIndex !== -1) {
        roomUsers[uIndex].score += 1;
      } else {
        console.warn(`User not found in roomUsers: ${username}`);
      }
      io.to(roomUsers[uIndex].roomId).emit("scoreboardUpdate", (roomUsers))
    })

    socket.on("nextTrigger", (roomId) =>{
      io.to(roomId).emit("next")
    })

    socket.on("disconnect", () => {
      const user = roomUsers.findIndex(user => user.userId === socket.id)
      console.log(roomUsers)
      if (user !== -1) {
        const { roomId } = roomUsers[user];
        roomUsers.splice(user);
      
        io.to(roomId).emit("usersUpdate", { count: roomUsers.filter(user => user.roomId == roomId).length || 0});
        console.log(roomUsers)
      }
    });
  });
}
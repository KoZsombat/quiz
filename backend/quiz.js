module.exports = function quizSocketHandler(io) {
  const roomUsers = [];

  io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => {
      socket.join(data.roomId);

      console.log(`username: ${data.name}, roomid: ${data.roomId}`)
      roomUsers.push({ roomId: data.roomId, userId: socket.id, username: data.name, score: 0 });

      console.log(`${socket.id} joined room ${data.roomId}, users: ${io.sockets.adapter.rooms.get(data.roomId).size}`);

      io.to(data.roomId).emit("usersUpdate", { count: roomUsers.filter(user => user.roomId == data.roomId).length || 0 });
    });

    socket.on("adminCon", (quizId) => {
      socket.join(quizId)
    })

    socket.on("startRoom", (roomId) => {
      io.to(roomId).emit("startQuiz")
    })

    socket.on("getQuiestions", async (roomId) => {
      socket.join(roomId)

      const questions = []

      const response = await fetch(`http://localhost:3000/api/getQuiz/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: roomId }),
      })
      console.log(roomId)
      let data;
      try {
        data = await response.json();
      } catch (err) {
        const text = await response.text();
        data = { error: text };
      }
      console.log(data)
      io.to(roomId).emit("sendQuestions", data)
    })

    socket.on("correctAns", (username) => {
      const uIndex = roomUsers.findIndex(u => u.username == username)
      roomUsers[uIndex].score += 1
    })

    // index lépegetések bef. , leaderboard megjelenítése

    socket.on("disconnect", () => {
      const user = roomUsers.findIndex(user => user.userId === socket.id)

      if (user !== -1) {
        const { roomId } = roomUsers[user];

        roomUsers.splice(user, 1);

        console.log(`${socket.id} left room ${roomId}, users remaining: ${roomUsers.filter(user => user.roomId == roomId).length || 0}`);
        
        io.to(roomId).emit("usersUpdate", { count: roomUsers.filter(user => user.roomId == roomId).length || 0});
      }
    });
  });
}
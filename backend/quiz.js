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

    socket.on("startRoom", () => {
      socket.emit("startQuiz")
    })

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
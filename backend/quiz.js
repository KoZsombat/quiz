module.exports = function quizSocketHandler(io) {
  const roomUsers = [];

  io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => {
      socket.join(data.roomId);

      console.log(`username: ${data.name}, roomid: ${data.roomId}`)
      roomUsers.push({ roomId: data.roomId, userId: socket.id, username: data.name, score: 0 });

      console.log(`${socket.id} joined room ${data.roomId}, users: ${io.sockets.adapter.rooms.get(data.roomId).size}`);

      io.to(data.roomId).emit("usersUpdate", roomUsers[data.roomId]);
    });

    socket.on("disconnect", () => {
      const user = roomUsers.findIndex(user => user.userId === socket.id)

      if (user !== -1) {
        console.log(`${socket.id} left room ${user.roomId}, users remaining: ${io.sockets.adapter.rooms.get(roomUsers[user].roomId)?.size || 0}`);
        roomUsers.splice(user, 1)
      }
    });
  });
}
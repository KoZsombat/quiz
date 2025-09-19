module.exports = function quizSocketHandler(io) {
  const roomUsers = {};

  io.on("connection", (socket) => {
    console.log("Felhasználó csatlakozott:", socket.id);

    socket.on("joinRoom", (data) => {
      socket.join(data.roomId);

      if (!roomUsers[data.roomId]) roomUsers[data.roomId] = [];
      console.log(`username: ${data.name}, roomid: ${data.roomId}`)
      roomUsers[data.roomId].push({ id: socket.id, username: data.name, score: 0 });

      console.log(`${socket.id} joined room ${data.roomId}, users: ${roomUsers[data.roomId].length}`);

      io.to(data.roomId).emit("usersUpdate", roomUsers[data.roomId]);
    });

    socket.on("disconnect", () => {
      console.log("DC-----------------")
      socket.rooms.forEach((roomId) => {
        if (roomUsers[roomId]) {
          const index = roomUsers[roomId].findIndex(user => user.id === socket.id);
          if (index !== -1) {
            roomUsers[roomId].splice(index, 1);
            console.log(`${socket.id} left room ${roomId}, users: ${roomUsers[roomId].length}`);
            io.to(roomId).emit("usersUpdate", roomUsers[roomId]);
          }
        }
      });
    });
  });
}
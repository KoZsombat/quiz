export default function quizSocketHandler(io: any) {
  interface RoomUser {
    id: string;
    username: string;
    score: number;
  }

  const roomUsers: Record<string, RoomUser[]> = {};

  io.on("connection", (socket: any) => {
    console.log("Felhasználó csatlakozott:", socket.id);

    socket.on("joinRoom", (roomId: string, name: string) => {
      socket.join(roomId);

      if (!roomUsers[roomId]) roomUsers[roomId] = [];
      roomUsers[roomId].push({ id: socket.id, username: name, score: 0 });

      console.log(`${socket.id} joined room ${roomId}, users: ${roomUsers[roomId].length}`);

      io.to(roomId).emit("usersUpdate", roomUsers[roomId]);
    });

    socket.on("disconnect", () => {
      socket.rooms.forEach((roomId: any) => {
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

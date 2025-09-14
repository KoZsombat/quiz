export default function quizSocketHandler(io) {
  io.on("connection", (socket) => {
    console.log("Felhasználó csatlakozott:", socket.id);

    // Példa: szoba belépés
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`${socket.id} joined room ${roomId}`);
    });

    // Példa: kérdés küldése
    socket.on("sendQuestion", ({ roomId, question }) => {
      io.to(roomId).emit("newQuestion", question);
    });

    // Példa: válasz beküldése
    socket.on("sendAnswer", ({ roomId, answer }) => {
      io.to(roomId).emit("newAnswer", { user: socket.id, answer });
    });

    socket.on("disconnect", () => {
      console.log("Felhasználó lecsatlakozott:", socket.id);
    });
  });
}

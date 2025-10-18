const { data } = require("react-router-dom");

module.exports = function quizSocketHandler(io) {

  const roomUsers = [];
  const roomList = []

  io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => {
      console.log("joinRoom data:", data);
      console.log("Current roomList:", roomList);
      console.log("Current roomUsers:", roomUsers);
      if (!roomList.some(r => r.roomId == data.roomId)) return
      socket.join(data.roomId);
      if (!roomUsers.some(p => p.username === data.name && p.roomId === data.roomId)) {
        roomUsers.push({ roomId: data.roomId, userId: socket.id, username: data.name, score: 0 }); // use jwt auth instead of username
        const rIndex = roomList.findIndex(r => r.roomId === data.roomId);
        roomList[rIndex].users.push(data.name)
      } else {
        io.to(socket.id).emit("nameExist");
      }
      io.to(data.roomId).emit("usersUpdate", { count: roomUsers.filter(user => user.roomId == data.roomId).length || 0 });
      console.log("Current roomUsers:", roomUsers);
    });

    socket.on("adminCon", (data) => {
      //if (!roomList.some(r => r.roomId == data.roomId)) return
      socket.join(data.quizId)
      if (!data.auth) io.to(socket.id).emit("joinError");
      if (!roomList.some(r => r.roomId == data.quizId)) 
        roomList.push({ roomId: data.quizId, isStarted: false, globalIndex: 0, users: [], auth: data.auth})
      else if (roomList.some(r => r.roomId == data.quizId && r.auth !== data.auth))
        io.to(socket.id).emit("joinError");
      io.to(data.quizId).emit("usersUpdate", { count: roomUsers.filter(user => user.roomId == data.quizId).length || 0});
      io.to(data.quizId).emit("scoreboardUpdate", (roomUsers))
    })

    socket.on("broadcastCon", (data) => {
      if (!roomList.some(r => r.roomId == data.roomId)) return
      socket.join(data.quizId)
    })

    socket.on("userCon", (data) => {
      if (!roomList.some(r => r.roomId == data.roomId)) return
      
      const { roomId, name } = data;

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

    socket.on("startRoom", (roomId) => {
      io.to(roomId).emit("startQuiz")
      io.to(roomId).emit("scoreboardUpdate", (roomUsers))
    })

    socket.on("getQuiestions", async (adat) => { //body has been already read error
      let roomId = adat.roomId;
      console.log("getQuiestions roomId:", roomId);
      if (!roomList.some(r => r.roomId == roomId)) return
      socket.join(roomId)
      try {
        const response = await fetch(`http://localhost:3000/api/getQuiz/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: roomId }), // ez string az a baj
        })
        let data;
        try {
          data = await response.json();
        } catch (err) {
          console.error("Error parsing JSON:", err);
          //const text = await response.text();
          //data = { error: text };
        }
        io.to(roomId).emit("sendQuestions", data)
      } catch (err) {
        console.error("Fetch error:", err);
        io.to(roomId).emit("sendQuestions", { error: "Failed to fetch data" });
      }
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
      const rIndex = roomList.findIndex(r => r.roomId === roomId)
      io.to(roomId).emit("next", (roomList[rIndex].globalIndex))
      roomList[rIndex].globalIndex += 1
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
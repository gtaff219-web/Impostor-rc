const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let rooms = {};

const words = [
  "Neymar","Messi","Cristiano Ronaldo",
  "Barcelona","Copa do Mundo"
];

io.on("connection", socket => {

  socket.on("joinRoom", ({room, name}) => {
    socket.join(room);

    if(!rooms[room]) rooms[room] = [];
    rooms[room].push({id: socket.id, name});

    io.to(room).emit("players", rooms[room]);
  });

  socket.on("startGame", (room) => {
    const players = rooms[room];
    const impostor = Math.floor(Math.random() * players.length);
    const word = words[Math.floor(Math.random() * words.length)];

    players.forEach((p, i) => {
      const role = i === impostor ? "IMPOSTOR 😈" : word;
      io.to(p.id).emit("role", role);
    });
  });

  socket.on("disconnect", () => {
    for (let room in rooms) {
      rooms[room] = rooms[room].filter(p => p.id !== socket.id);
    }
  });

});

http.listen(3000, () => console.log("Servidor rodando"));

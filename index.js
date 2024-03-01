const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("./public"));

let connected_users = [];
let userNames = [];
let acceptBuzzes = 0;

io.use((socket, next) => {
  socket.userName = socket.request._query.userName;
  next();
});

io.on("connect", (socket) => {
  const userName = socket.userName + "";
  if (!userNames.includes(userName)) {
    userNames.push(userName);
    connected_users.push({ userName: userName, id: socket.id });
  } else {
    socket.disconnect(true);
  }

  socket.on("disconnect", () => {
    connected_users = connected_users.filter(
      ({ userName: connectedUserName }) => {
        return connectedUserName != userName;
      }
    );
    userNames = userNames.filter((connectedUserName) => {
      return connectedUserName != userName;
    });
  });
});

server.listen(3000, () => {
  console.log("Server listening on port 3000...");
});

const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("./public"));
app.use("/admin", express.static("./public/assets"));
app.get("/admin", (_, res) => {
  res.sendFile(__dirname + "/public/pages/admin.html");
});

let connected_users = [];
let userNames = [];
let buzzedUsers = [];
let acceptBuzzes = false;

io.use((socket, next) => {
  socket.userName = socket.request._query.userName;
  socket.team = socket.request._query.team;
  socket.active = false;
  next();
});

io.of("/").on("connect", (socket) => {
  const userName = socket.userName.toLowerCase().trim();
  const team = socket.team.toLowerCase().trim();

  if (!userName) {
    socket.emit("badLogin", "noUsername");
    socket.disconnect();
  } else if (!team) {
    socket.emit("badLogin", "noTeam");
    socket.disconnect();
  } else if (userNames.includes(userName)) {
    socket.emit("badLogin", "usernameExists");
    socket.disconnect();
  } else {
    userNames.push(userName);
    connected_users.push({ userName, id: socket.id, team });
  }

  socket.on("buzz", () => {
    if (!acceptBuzzes) {
      return;
    }

    const buzzTime = new Intl.DateTimeFormat("en-us", {
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: "3",
    }).format(new Date());

    socket.emit("inactive");

    reducedBuzzers = buzzedUsers.reduce(
      (buzzers, buzzer) => {
        buzzers.userNames.push(buzzer.userName);
        buzzers.colors.push(buzzer.color);
        return buzzers;
      },
      { userNames: [], colors: [] }
    );

    if (!reducedBuzzers.userNames.includes(userName)) {
      if (!reducedBuzzers.colors.includes(team)) {
        buzzedUsers.push({
          userName,
          time: buzzTime,
          color: team,
        });
      } else {
        buzzedUsers.push({
          userName,
          time: buzzTime,
          color: "gray",
        });
      }

      io.of("/admin").emit("updatedBuzzed", buzzedUsers);
      io.emit("updatedBuzzed", buzzedUsers);
    }
  });

  socket.on("disconnect", () => {
    connected_users = connected_users.filter(
      ({ userName: connectedUserName }) => {
        return connectedUserName != userName;
      }
    );
    userNames = userNames.filter((connectedUserName) => {
      return connectedUserName != userName;
    });
    buzzedUsers = buzzedUsers.filter(({ userName: buzzerUser }) => {
      return buzzerUser != userName;
    });
  });
});

io.of("/admin").on("connect", (socket) => {
  socket.on("enableBuzzer", (time) => {
    acceptBuzzes = true;
    buzzedUsers = [];
    io.of("/admin").emit("updatedBuzzed", buzzedUsers);
    io.emit("updatedBuzzed", buzzedUsers);

    io.of("/admin").emit("active", time);
    io.emit("active", time);
  });

  socket.on("disableBuzzer", () => {
    acceptBuzzes = false;

    io.of("/admin").emit("inactive");
    io.emit("inactive");
  });

  socket.on("clearBuzzes", () => {
    acceptBuzzes = false;
    buzzedUsers = [];

    io.of("/admin").emit("cleared");
    io.of("/admin").emit("updatedBuzzed", buzzedUsers);
    io.emit("updatedBuzzed", buzzedUsers);

    io.of("/admin").emit("inactive");
    io.emit("inactive");
  });
});

server.listen(3000, () => {
  console.log("Server listening on port 3000...");
});

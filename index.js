const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const { formatTime } = require("./utils/formatTime.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("./public"));
app.use("/admin", express.static("./public/assets"));
app.get("/admin", (_, res) => {
  res.sendFile(__dirname + "/public/pages/admin.html");
});

let acceptBuzzes = false;
let users = [];

const getUser = (userName) => {
  return users.find((user) => user.userName == userName);
};
const getUserNames = () => {
  return users.map(({ userName }) => userName);
};
const resetBuzzedUsers = () => {
  users.forEach((user) => {
    user.buzzStatus = { buzzed: false, time: "0:0:0", color: "" };
  });
};
const getBuzzedUsers = () => {
  return users
    .reduce((buzzers, { userName, buzzStatus: { buzzed, time, color } }) => {
      if (buzzed) {
        buzzers.push({ userName, time, color });
      }
      return buzzers;
    }, [])
    .toSorted((firstBuzzer, secondBuzzer) => {
      return (
        Number(firstBuzzer.time.split(":").join("")) -
        Number(secondBuzzer.time.split(":").join(""))
      );
    });
};
const getRegisteredUsers = () => {
  return users.map(({ userName, connected }) => {
    return { userName, connected };
  });
};
const removeRegisteredUser = (userName) => {
  const socket = io.sockets.sockets.get(getUser(userName).id);
  if (socket) socket.disconnect();
  users = users.filter((user) => {
    return user.userName != userName;
  });
};

io.use((socket, next) => {
  socket.userName = socket.request._query.userName.toLowerCase().trim();
  socket.team = socket.request._query.team.toLowerCase().trim();
  socket.active = false;
  next();
});

io.of("/").on("connect", (socket) => {
  socket.emit("updatedBuzzed", getBuzzedUsers());

  const userName = socket.userName;
  const team = socket.team;

  const user = getUser(userName);

  if (!userName) {
    socket.emit("badLogin", "noUserName");
    socket.disconnect();
  } else if (!team) {
    socket.emit("badLogin", "noTeam");
    socket.disconnect();
  } else if (!user) {
    socket.emit("badLogin", "userNameNotRegistered");
    socket.disconnect();
  } else if (user.connected) {
    socket.emit("badLogin", "userNameAlreadyConnected");
    socket.disconnect();
  } else {
    user.connected = true;
    user.team = team;
    user.id = socket.id;
    io.of("/admin").emit("updateRegisteredUsers", getRegisteredUsers());
  }

  socket.on("buzz", () => {
    if (!acceptBuzzes) {
      return;
    }

    socket.emit("inactive");

    const buzzedColors = users.reduce((colors, buzzer) => {
      if (buzzer.buzzStatus.buzzed) {
        colors.push(buzzer.team);
      }
      return colors;
    }, []);

    if (!user.buzzStatus.buzzed) {
      user.buzzStatus.buzzed = true;
      user.buzzStatus.time = formatTime();

      if (!buzzedColors.includes(team)) {
        user.buzzStatus.color = team;
      } else {
        user.buzzStatus.color = "gray";
      }

      const buzzedUsers = getBuzzedUsers();

      io.of("/admin").emit("updatedBuzzed", buzzedUsers);
      io.emit("updatedBuzzed", buzzedUsers);
    }
  });

  socket.on("disconnect", () => {
    users.forEach((user) => {
      if (user.userName == userName) {
        user.connected = false;
      }
    });

    io.of("/admin").emit("updateRegisteredUsers", getRegisteredUsers());
  });
});

io.of("/admin").on("connect", (socket) => {
  socket.emit("updatedBuzzed", getBuzzedUsers());
  socket.emit("updateRegisteredUsers", getRegisteredUsers());
  socket.on("registerUser", (userName) => {
    if (getUserNames().includes(userName)) {
      // TODO
      socket.emit("Username already registered!");
    } else {
      users.push({
        userName: userName.toLowerCase().trim(),
        team: "",
        id: "",
        connected: false,
        buzzStatus: {
          buzzed: false,
          time: "0:0:0",
          color: "",
        },
      });
      io.of("/admin").emit("updateRegisteredUsers", getRegisteredUsers());
    }
  });

  socket.on("removeRegisteredUser", (userName) => {
    if (!getUserNames().includes(userName)) {
      // TODO
      socket.emit("Username not registered!");
    } else {
      removeRegisteredUser(userName);
      io.of("/admin").emit("updateRegisteredUsers", getRegisteredUsers());
    }
  });

  socket.on("enableBuzzer", (time) => {
    if (acceptBuzzes) {
      return;
    }

    acceptBuzzes = true;

    resetBuzzedUsers();
    const buzzedUsers = getBuzzedUsers();
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

    resetBuzzedUsers();
    const buzzedUsers = getBuzzedUsers();

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

import { changeHTML, main } from "./index.js";
import { connectedPage, buzzesList } from "./components.js";

export const joinRoom = (userName, team) => {
  let connected = false;
  let buzzesListElement;
  let loginTimoutId;
  let alertResetTimeoutId;
  let alertErrorTimeoutId;
  let buzzer;
  let active = false;
  let timerPerSecondId;
  let timerTotalId;

  clearTimeout(alertResetTimeoutId);
  clearTimeout(alertErrorTimeoutId);

  const alert = document.querySelector("#alert");
  changeHTML(`Connecting to server...`, alert);
  alert.classList.remove("hidden-alert");

  const socket = io({ query: `userName=${userName}&team=${team}` });

  const startTimer = (time) => {
    stopTimer(time);

    timerPerSecondId = setInterval(() => {
      buzzer.textContent = Number(buzzer.textContent) - 1;
    }, 1000);

    timerTotalId = setTimeout(() => {
      clearTimeout(timerPerSecondId);
      disableBuzzer();
    }, time * 1000);
  };

  const stopTimer = (time = 0) => {
    buzzer.textContent = time;

    clearTimeout(timerPerSecondId);
    clearTimeout(timerTotalId);
  };

  socket.on("connect", () => {
    loginTimoutId = setTimeout(() => {
      connected = true;
      changeHTML(connectedPage(userName));
      buzzesListElement = document.querySelector("#buzzes-list");
      buzzer = document.querySelector("#buzzer");
      buzzer.classList.add("inactive");
      buzzer.addEventListener("click", () => {
        if (active) {
          socket.emit("buzz");
        }
      });
    }, 1250);
  });

  socket.on("active", (time) => {
    active = true;
    buzzer.classList.remove("inactive");
    startTimer(time);
  });

  socket.on("inactive", () => {
    active = false;
    buzzer.classList.add("inactive");
    stopTimer();
  });

  socket.on("updatedBuzzed", (data) => {
    if (connected) {
      changeHTML(buzzesList(data), buzzesListElement);
    }
  });

  socket.on("badLogin", (reason) => {
    let errorMessage;
    switch (reason) {
      case "noUserName":
        errorMessage = "Please enter a valid username!";
        break;
      case "noTeam":
        errorMessage = "Please select a team!";
        break;
      case "userNameNotRegistered":
        errorMessage =
          "Username not registered. Please contact the organizers!";
        break;
      case "userNameAlreadyConnected":
        errorMessage = "Username already exists. Please pick a different one!";
        break;
      case "teamNotMatch":
        errorMessage =
          "Team does not match. Please change your team selection!";
        break;

      default:
        errorMessage = "An error occured. Could not connect!";
        break;
    }

    alertErrorTimeoutId = setTimeout(() => {
      changeHTML(errorMessage, alert);
      alert.classList.remove("hidden-alert");
    }, 500);

    alertResetTimeoutId = setTimeout(() => {
      changeHTML("", alert);
      alert.classList.add("hidden-alert");
    }, 1750);
  });

  socket.on("disconnect", () => {
    clearTimeout(loginTimoutId);
    if (connected) {
      main();
    }
  });
};

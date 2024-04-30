import { buzzesList, registeredUsersList, scorePanels } from "./components.js";

const buzzesListElement = document.querySelector("#spectator-buzzes-list");
const timer = document.querySelector("#enable-timer");
// const buzzerSound = document.querySelector("#buzzer-sound");
const usersList = document.querySelector(".spectator-screen-users");
const scoresContainer = document.querySelector("#scores");

// let buzerSoundTimeoutId;

const socket = io("/spectator");

buzzesListElement.innerHTML = buzzesList();

const initializeRegisteredUsers = (registeredUsers) => {
  usersList.innerHTML = registeredUsersList(registeredUsers, true);
};

scoresContainer.innerHTML = scorePanels();

initializeRegisteredUsers();

let timerPerSecondID;
let timerTotalID;
const startTimer = (time) => {
  stopTimer(time);

  timerPerSecondID = setInterval(() => {
    timer.textContent = Number(timer.textContent) - 1;
  }, 1000);

  timerTotalID = setTimeout(() => {
    clearTimeout(timerPerSecondID);
    disableBuzzer();
  }, time * 1000);
};

const stopTimer = (time = 0) => {
  timer.textContent = time;

  clearTimeout(timerPerSecondID);
  clearTimeout(timerTotalID);
};

socket.on("active", (time) => {
  startTimer(time);
});

socket.on("inactive", () => {
  stopTimer();
});

socket.on("cleared", () => {
  clearButton.setAttribute("disabled", true);
});

socket.on("updatedBuzzed", (data) => {
  // if (data.length > 0) {
  //   clearTimeout(buzerSoundTimeoutId);
  //   buzzerSound.currentTime = 0;
  //   buzzerSound.play();
  //   buzerSoundTimeoutId = setTimeout(() => {
  //     buzzerSound.pause();
  //   }, 500);
  // }
  buzzesListElement.innerHTML = buzzesList(data);
});

socket.on("updateRegisteredUsers", (registeredUsers) => {
  initializeRegisteredUsers(registeredUsers);
});

socket.on("updatedScores", (teamScores) => {
  scoresContainer.innerHTML = scorePanels(teamScores);
});

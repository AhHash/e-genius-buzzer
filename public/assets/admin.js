import { buzzesList } from "./components.js";

const buzzesListElement = document.querySelector("#buzzes-list");
const disableButton = document.querySelector("#disable-button");
const clearButton = document.querySelector("#clear-button");
const enableButtons = document.querySelectorAll(".enable-button");
const timer = document.querySelector("#enable-timer");

const socket = io("/admin");

const enableBuzzer = (time) => {
  socket.emit("enableBuzzer", time);
};

const disableBuzzer = () => {
  socket.emit("disableBuzzer");
};

const clearBuzzes = () => {
  socket.emit("clearBuzzes");
};

buzzesListElement.innerHTML = buzzesList();

disableButton.setAttribute("disabled", true);
clearButton.setAttribute("disabled", true);

disableButton.addEventListener("click", disableBuzzer);
clearButton.addEventListener("click", clearBuzzes);
const colors = ["red", "blue", "green"];
colors.forEach((color) => {
  const enableButton = document.querySelector(`.${color}-enable`);
  enableButton.addEventListener("click", () => {
    enableBuzzer(Number(enableButton.dataset.time));
  });
});

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
  enableButtons.forEach((enableButton) => {
    enableButton.classList.add("disabled");
  });
  disableButton.removeAttribute("disabled");
  clearButton.removeAttribute("disabled");

  startTimer(time);
});

socket.on("inactive", () => {
  enableButtons.forEach((enableButton) => {
    enableButton.classList.remove("disabled");
  });
  disableButton.setAttribute("disabled", true);

  stopTimer();
});

socket.on("cleared", () => {
  clearButton.setAttribute("disabled", true);
});

socket.on("updatedBuzzed", (data) => {
  buzzesListElement.innerHTML = buzzesList(data);
});

import { buzzesList, registeredUsersList } from "./components.js";

const buzzesListElement = document.querySelector("#buzzes-list");
const disableButton = document.querySelector("#disable-button");
const clearButton = document.querySelector("#clear-button");
const enableButtons = document.querySelectorAll(".enable-button");
const timer = document.querySelector("#enable-timer");
const buzzerSound = document.querySelector("#buzzer-sound");
const rightSide = document.querySelector(".right-side");

let buzerSoundTimeoutId;

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

const registerUser = (userName, team) => {
  socket.emit("registerUser", userName, team);
};

const removeRegisteredUser = (userName) => {
  socket.emit("removeRegisteredUser", userName);
};

buzzesListElement.innerHTML = buzzesList();

let addUserButton;
let addUserInput;
let newUserForm;
let teamInputs;

const initializeRegisteredUsers = (registeredUsers) => {
  rightSide.innerHTML = registeredUsersList(registeredUsers);
  const deleteUserButtons = document.querySelectorAll(".delete-user");
  addUserButton = document.querySelector("#add-button");
  addUserInput = document.querySelector(".user-input");
  newUserForm = document.querySelector("#new-user-form");
  teamInputs = document.querySelectorAll(".admin-team-button");
  let teamInput = "red";

  teamInputs.forEach((teamButton) => {
    teamButton.addEventListener("click", ({ currentTarget }) => {
      teamInputs.forEach((teamButton) => {
        teamButton.classList.remove("selected");
      });
      currentTarget.classList.add("selected");
      teamInput = currentTarget.dataset.team;
    });
  });

  newUserForm.addEventListener("submit", (submitEvent) => {
    submitEvent.preventDefault();
  });

  addUserButton.addEventListener("click", () => {
    if (addUserInput.value) {
      registerUser(addUserInput.value, teamInput);
    }
  });

  deleteUserButtons.forEach((button) => {
    button.addEventListener("click", () => {
      removeRegisteredUser(button.dataset.username);
    });
  });
};

initializeRegisteredUsers();

disableButton.setAttribute("disabled", true);
clearButton.setAttribute("disabled", true);

disableButton.addEventListener("click", disableBuzzer);
clearButton.addEventListener("click", clearBuzzes);
const colors = ["red", "blue", "green"];
colors.forEach((color) => {
  const enableButton = document.querySelector(`.${color}-enable`);
  enableButton.addEventListener("click", () => {
    if ([...enableButton.classList].includes("disabled")) {
      return;
    }
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
  if (data.length > 0) {
    clearTimeout(buzerSoundTimeoutId);
    buzzerSound.currentTime = 0;
    buzzerSound.play();
    buzerSoundTimeoutId = setTimeout(() => {
      buzzerSound.pause();
    }, 500);
  }
  buzzesListElement.innerHTML = buzzesList(data);
});

socket.on("updateRegisteredUsers", (registeredUsers) => {
  initializeRegisteredUsers(registeredUsers);
});

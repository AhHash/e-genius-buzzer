import { buzzesList, registeredUsersList, scorePanels } from "./components.js";

const buzzesListElement = document.querySelector("#buzzes-list");
const disableButton = document.querySelector("#disable-button");
const clearButton = document.querySelector("#clear-button");
const enableButtons = document.querySelectorAll(".enable-button");
const timer = document.querySelector("#enable-timer");
const buzzerSound = document.querySelector("#buzzer-sound");
const rightSide = document.querySelector(".right-side");
const scoresContainer = document.querySelector("#scores");

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
let addableUsersItems;
let scoreUserItem;

const updateAddableUsersListeners = () => {
  addableUsersItems = document.querySelectorAll(".addable-to-score");

  addableUsersItems.forEach((user) => {
    user.addEventListener("click", ({ currentTarget }) => {
      addUserToScoreInput(currentTarget.dataset.username);
    });
  });
};

const addUserToScoreInput = (userName) => {
  scoreUserItem.innerHTML = `
    <div class="score-user">
      <div class="user-info">
        <h4 class="user-name score-user-name">${userName}</h4>
      </div>
      <div class="user-buttons score-buttons">
        <button data-score="-5" class="user-button score-button red-score-button">-5</button>
        <button data-score="5" class="user-button score-button green-score-button">+5</button>
        <button data-score="10" class="user-button score-button blue-score-button white-score-button">+10</button>
        <button data-score="20" class="user-button score-button red-score-button">+20</button>
        <button data-score="30" class="user-button score-button green-score-button">+30</button>
      </div>
    </div>
  `;

  document.querySelectorAll(".score-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      socket.emit(
        "changeScore",
        userName,
        Number(event.currentTarget.dataset.score)
      );
    });
  });
};

const initializeRegisteredUsers = (registeredUsers) => {
  rightSide.innerHTML = registeredUsersList(registeredUsers);
  const deleteUserButtons = document.querySelectorAll(".delete-user");
  addUserButton = document.querySelector("#add-button");
  addUserInput = document.querySelector(".user-input");
  newUserForm = document.querySelector("#new-user-form");
  teamInputs = document.querySelectorAll(".admin-team-button");
  scoreUserItem = document.querySelector(".score-user-item");
  let teamInput = "red";

  updateAddableUsersListeners();

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

scoresContainer.innerHTML = scorePanels();

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
  updateAddableUsersListeners();
});

socket.on("updateRegisteredUsers", (registeredUsers) => {
  initializeRegisteredUsers(registeredUsers);
});

socket.on("updatedScores", (teamScores) => {
  scoresContainer.innerHTML = scorePanels(teamScores);
});

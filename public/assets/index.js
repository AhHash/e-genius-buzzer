import { homePage } from "./components.js";
import { joinRoom } from "./socketLogic.js";

const home = document.querySelector("#home");

const main = () => {
  let userName = "";
  let team = "";

  changeHTML(homePage());
  const joinRoomButton = document.querySelector("#join-room-button");
  joinRoomButton.addEventListener("click", () => {
    joinRoom(userName, team);
  });

  const input = document.querySelector("#name-input");
  input.addEventListener("input", ({ currentTarget: { value } }) => {
    userName = value;
  });

  const teamInputs = document.querySelectorAll(".team-button");
  const teamSelectionText = document.querySelector("#team-buttons-text");
  teamInputs.forEach((teamButton) => {
    teamButton.addEventListener("click", ({ currentTarget }) => {
      teamInputs.forEach((teamButton) => {
        teamButton.classList.remove("selected");
      });
      currentTarget.classList.add("selected");
      const teamSelection = currentTarget.dataset.team;
      teamSelectionText.textContent = `You're ${currentTarget.dataset.team}`;
      team = teamSelection;
    });
  });
};

export const changeHTML = (content, element = home) => {
  element.innerHTML = content;
};

main();

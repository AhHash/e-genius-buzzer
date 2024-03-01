let userName = "";

const main = () => {
  const home = document.querySelector("#home");
  changeHTML(homePage);

  const input = document.querySelector("#name");
  input.addEventListener("input", ({ currentTarget: { value } }) => {
    userName = value;
  });
};

const joinRoom = () => {
  let timeoutId;

  changeHTML(`<h1 class="title">Connecting to server...<h1/>`);
  const socket = io({ query: `userName=${userName}` });
  socket.on("connect", (socket) => {
    timeoutId = setTimeout(() => {
      changeHTML(`<h1 class="title">Connected<h1/>`);
    }, 1250);
  });

  socket.on("disconnect", (socket) => {
    clearTimeout(timeoutId);
    changeHTML(
      `<h1 class="title">Username already exists. Please pick a different one!<h1/>`
    );

    timeoutId = setTimeout(() => {
      changeHTML(homePage);
    }, 1250);
  });
};

const changeHTML = (content, element = home) => {
  element.innerHTML = content;
};

const homePage = `
 <div class="container">
    <div id="title">E-Gen<span class="red">i</span>us</div>
      <div class="form">
        <input
          id="name"
          type="text"
          class="form-input"
          placeholder="What do you wanna be called? :)"
        />
      <div class="btn home-btn" onclick="joinRoom()">Connect</div>
    </div>
  </div>
`;
main();

export const homePage = () => {
  return `
 <div class="container">
    <div id="title">E-Gen<span class="red">i</span>us</div>
      <div class="form">
      <div class="form-input-container">
      <div class="form-input-frame">     
      <input
        id="name-input"
        type="text"
        class="form-input"
        placeholder="What do you wanna be called? :)"
      /> 
      </div>
        <div id="alert" class="hidden-alert"></div>
      </div>
        <div class="team-buttons-container">
          <h5 id="team-buttons-text">Choose team</h5>
          <div class="team-buttons">
            <div data-team="red" class="team-button red-team-button"></div>
            <div data-team="blue" class="team-button blue-team-button"></div>
          </div>
        </div>
      <div id="join-room-button" class="btn home-btn">Connect</div>
    </div>
  </div>
`;
};

export const connectedPage = (userName, data) => {
  return `
 <div id="connected-page">
        <div class="header">
          <h5 class="header-logo">E-Genius</h5>
          <h3 class="header-username">Username: ${userName}</h3>
        </div>
        <div class="buzzes-list-container">
          <div id="buzzes-list">
            ${buzzesList(data)}
          </div>
        </div>
        <div class="buzzer-container">
          <div id="buzzer">0</div>
        </div>
      </div>
`;
};

export const buzzesList = (data) => {
  if (!data || data.length < 1) {
    return `
    <h4 class="no-buzzes-text"> Nobody has buzzed yet!
    `;
  }
  const users = [...data];
  const numUsers = users.length;
  const columnSize = numUsers > 8 ? 5 : 4;
  let secondHalf = [];
  if (numUsers > columnSize) {
    secondHalf = users.splice(columnSize, numUsers - columnSize);
    console.log(secondHalf);
  }

  return `
            <ol class="buzzes-list-column">
              ${users
                .map(({ userName, time, color }) => {
                  return `<li class="buzzes-item ${color}-buzzes">
                  ${userName}
                  <div class="buzzes-item-time">${time}</div>
                </li>`;
                })
                .join("")}
            </ol>
            <ol class="buzzes-list-column" start="5">
              ${secondHalf
                .map(({ userName, time, color }) => {
                  return `<li class="buzzes-item  ${color}-buzzes">
                  ${userName}
                  <div class="buzzes-item-time">${time}</div>
                </li>`;
                })
                .join("")}
            </ol>
   `;
};

export const registeredUsersList = (registeredUsers = []) => {
  return `
        <h3 class="users-text">Users</h3>
          <ul class="users-list">
          ${
            registeredUsers.length
              ? registeredUsers
                  .map(({ userName, connected }) => {
                    return `
            <li>
              <div class="user-item ${connected && "connected"}">
                <div class="user-info">
                  <h4 class="user-name">${userName}</h4>
                  <p class="user-status">${
                    connected ? "connected" : "pending"
                  }</p>
                </div>
                <div class="user-buttons">
                  <button data-username="${userName}" class="user-button delete-user">X</button>
                </div>
              </div>
            </li>      
            `;
                  })
                  .join("")
              : `<h4 class="no-registered-users-text">No registered users!</h4>`
          }
            <hr />
            <li>
              <form class="user-item" id="new-user-form">
                <input
                  type="text"
                  class="user-input"
                  placeholder="add new user"
                />
                <div class="user-buttons">
                  <button type="submit" class="user-button" id="add-button">Add</button>
                </div>
              </form>
            </li>
          </ul>
  `;
};

const socket = io(); // Behövs för att få tillgång till socket.io.

const formUser = document.querySelector("#formUser");
const inputUser = document.querySelector("#inputUser");
const messages = document.querySelector("#messages");
const message = document.querySelector("#message");
const formMessage = document.querySelector("#formMessage");
const inputMessage = document.querySelector("#inputMessage");
const userContianer = document.querySelector("#userContainer");
const results = document.querySelector("#results");
const roll = document.querySelector("#roll");

let myUser;

formUser.addEventListener("submit", function (e) {
  e.preventDefault();
  myUser = inputUser.value;
  userContianer.innerHTML = "<h2>Välkommen " + myUser + "</h2>";
  document.getElementById("user").style.display = "none";
  document.getElementById("message").style.display = "block";
});

formMessage.addEventListener("submit", function (e) {
  e.preventDefault();
  if (inputMessage.value) {
    //skickar ett “chat event” till server-side
    socket.emit("chatMessage", { user: myUser, message: inputMessage.value });
    inputMessage.value = "";
    inputUser.value = "";
  }
});

document.getElementById("roll").addEventListener("click", function () {
  //skickar ett “tärnings event” till server-side
  socket.emit("diceResults", { user: myUser, diceRoll: getRandomNumber(1, 6) });
});

// Funtion som returnerar ett random nummer mellan två värden, min-max.
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// // Funktion för tärningskastet där värdet är mellan 1-6
const rollDice = () => getRandomNumber(1, 6);

//tar emot ett event från server-side newChatMessage. Det är namnet som används på server-side när man skickar ett event till alla anslutna.
socket.on("newChatMessage", function (msg) {
  let item = document.createElement("li");
  item.textContent = msg;
  messages.appendChild(item);
});

//tar emot ett event från server-side newDiceResults. Det är namnet som används på server-side när man skickar ett event till alla anslutna.
socket.on("newDiceResults", function (dice) {
  let item = document.createElement("li");
  item.textContent = dice;
  results.appendChild(item);
});

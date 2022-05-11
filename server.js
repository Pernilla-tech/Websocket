const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const port = 3000;

const mongo = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
let db;

mongo.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, client) => {
    if (err) {
      console.error(err);
      return;
    }
    db = client.db("nodesocket");
    messages = db.collection("messages");
    dice = db.collection("dice");
  }
);

app.use(express.static("public"));

// endpoint som visat alla meddelanden som är sparade i databasen.
app.get("/messages", (req, res) => {
  messages.find().toArray((err, items) => {
    if (err) throw err;
    res.json({ messages: items });
  });
});

// endpoint som visat alla tärningskast som är sparade i databasen.
app.get("/dice", (req, res) => {
  dice.find().toArray((err, items) => {
    if (err) throw err;
    res.json({ dice: items });
  });
});

//skapar en ny anslutning
io.on("connection", (socket) => {
  console.log(`A client with id ${socket.id} connected to the chat!`);

  //Tar emot ett chat-event från klienten
  socket.on("chatMessage", (msg) => {
    console.log("Meddelanden: " + msg.message);

    //Skickar ett event till alla som är anslutna
    io.emit("newChatMessage", msg.user + " : " + msg.message);
    //Lägger till datan i MongoDb
    messages.insertOne(
      {
        user: msg.user,
        message: msg.message,
      },
      (err, result) => {
        if (err) throw err;
        console.log(result);
      }
    );
  });

  const userTotalScores = {};

  //Tar emot ett tärnings-event från klienten
  socket.on("diceResults", (msg) => {
    const userKey = socket.id;

    if (userTotalScores[userKey] == undefined) {
      userTotalScores[userKey] = 0;
    }

    userTotalScores[userKey] += msg.diceRoll;

    //Skickar ett event till alla som är anslutna
    io.emit(
      "newDiceResults",
      `${msg.user}: ${msg.diceRoll} (total sum of rolls: ${userTotalScores[userKey]})`
    );

    //Lägger till datan i MongoDb
    dice.insertOne(
      {
        user: msg.user,
        Total: msg.diceRoll,
      },
      (err, result) => {
        if (err) throw err;
        console.log(result);
      }
    );
  });

  // körs när en anslutning kopplar ner
  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} disconnected!`);
  });
});

server.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

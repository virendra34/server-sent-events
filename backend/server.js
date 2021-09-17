const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/status", (request, response) =>
  response.json({ clients: clients.length })
);

const PORT = 8000;

let clients = [];
let facts = [];

app.listen(PORT, () => {
  console.log(`Facts Events service listening at http://localhost:${PORT}`);
});

// ...

async function eventsHandler(request, response, next) {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  response.writeHead(200, headers);
  const clientId = Date.now();

  let i = 0;
  const intervalId = setInterval(() => {
    if (i > 1000) clearInterval(intervalId);
    var arr = {
      info: `test-${i}`,
      source: `source-${i}`,
    };
    // facts.push(arr);
    // console.log(arr);
    const data = `data: ${JSON.stringify(arr)}\n\n`;
    response.write(data);

    const newClient = {
      id: clientId,
      response,
    };

    clients.push(newClient);
    i++;
  }, 1000);

  console.log("facts:", facts);
  request.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((client) => client.id !== clientId);
  });
}

app.get("/events", eventsHandler);

// ...

function sendEventsToAll(newFact) {
  clients.forEach((client) =>
    client.response.write(`data: ${JSON.stringify(newFact)}\n\n`)
  );
}

async function addFact(request, respsonse, next) {
  const newFact = request.body;
  facts.push(newFact);
  respsonse.json(newFact);
  return sendEventsToAll(newFact);
}

app.post("/fact", addFact);

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const webPush = require("web-push");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const corsOptions = {
  origin: "*", // Change to your React app's origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable credentials (cookies, authorization headers)
  optionsSuccessStatus: 204, // Respond to preflight requests with 204 status code
};

app.use(cors(corsOptions));
app.use(express.json());

let subscribed = [];

const publicKey =
  "BCRMXt1KpONBNVLwaae1F5M6rRqBB-c79xXZ_UcWufu4ZHHAWtSJuStvUSx0wl8a110vQ4HU2aZnjXuoJumuGJs";
const privateKey = "-WuHDApwUMghjwMFToirIn1iBnXCZfeW8gYe6-TaFmU";

webPush.setVapidDetails(
  "mailto:alex.maslennikova19@gmail.com", // Your contact information
  publicKey,
  privateKey
);

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    // Handle WebSocket messages
    console.log(`Received: ${message}`);
    // You can broadcast messages to all connected clients here
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscribed.push(subscription);
  res.status(201).json({});
});

function broadcastMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Broadcast a push notification to all subscribed clients
function sendPushNotification(message) {
  subscribed.forEach((subscription) => {
    console.log(subscription);
    const payload = JSON.stringify({ title: "Notification", body: message });
    console.log("push payload", payload);
    webPush.sendNotification(subscription, payload).catch((error) => {
      console.error("Error sending push notification:", error);
    });
  });
}

// Example: Send a message every 5 seconds
setInterval(() => {
  broadcastMessage("Message from server!");
}, 5000);

// Example: Send push every  5 sec
setInterval(() => {
  sendPushNotification("Push notification from server!");
}, 60000);

server.listen(3001, () => {
  console.log("Server listening on port 3001");
});

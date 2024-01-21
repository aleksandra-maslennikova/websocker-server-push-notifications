// index.js

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const webPush = require("web-push");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
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

function broadcastMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Endpoint to subscribe for push notifications
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscribed.push(subscription);
  console.log({ subscribed });
  // Store the subscription information or handle as needed

  res.status(201).json({});
});

// Broadcast a push notification to all subscribed clients
function sendPushNotification(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({ title: "Notification", body: message });
      webPush.sendNotification(client.subscription, payload);
    }
  });
}

// Example: Send a message every 5 seconds
setInterval(() => {
  broadcastMessage("Message from server!");
}, 5000);

// Example: Send a message every 5 seconds
setInterval(() => {
  sendPushNotification("Push notification from server!");
}, 10000);

server.listen(3001, () => {
  console.log("Server listening on port 3001");
});

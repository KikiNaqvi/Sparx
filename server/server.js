// ====== server.js ======
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// ----- Message System -----
let latestMessage = "";
let latestTimestamp = 0;

app.post("/msg/send", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  latestMessage = message;
  latestTimestamp = Date.now();
  console.log(`💌 New broadcast at ${new Date(latestTimestamp).toISOString()}:`, message);
  res.json({ status: "ok", message, timestamp: latestTimestamp });
});

app.get("/msg/latest", (req, res) => {
  res.json({ message: latestMessage, timestamp: latestTimestamp });
});

// ----- Event System -----
let events = {}; // store enabled events

function setEventAutoDisable(eventName, time = null) {
  events[eventName] = {
    enabled: true,
    time: time,
    updated: Date.now(),
  };

  console.log(`🎉 Event set: ${eventName} ${time ? `(time: ${time})` : ""}`);

  if (eventName !== "countdown") {
    setTimeout(() => {
      if (events[eventName]) {
        events[eventName].enabled = false;
        console.log(`⏱️ Event automatically disabled: ${eventName}`);
      }
    }, 60000);
  }
}

app.post("/api/setevent", (req, res) => {
  const { event, time } = req.body;
  if (!event) return res.status(400).json({ error: "No event name provided" });

  setEventAutoDisable(event, time);
  res.json({ status: "ok", event: events[event] });
});

app.get("/api/events", (req, res) => {
  res.json(events);
});

app.post("/api/clearevents", (req, res) => {
  events = {};
  console.log("🛑 All events cleared");
  res.json({ status: "ok", cleared: true });
});

// ======================
// 🎨 Multiplayer Drawing
// ======================
let drawingStrokes = []; // store all strokes globally

app.post("/api/draw", (req, res) => {
  const { stroke } = req.body;
  if (!stroke) return res.status(400).json({ error: "No stroke data provided" });

  drawingStrokes.push(stroke);
  if (drawingStrokes.length > 500) drawingStrokes.shift(); // keep recent only
  res.json({ status: "ok" });
});

app.get("/api/draw", (req, res) => {
  res.json(drawingStrokes);
});

app.post("/api/draw/clear", (req, res) => {
  drawingStrokes = [];
  console.log("🧹 Drawing canvas cleared");
  res.json({ status: "ok", cleared: true });
});

// ======================
// 🔑 User API Key System
// ======================
let userKeys = {}; // store username -> API key mapping

// Save user API key
app.post("/api/saveKey", (req, res) => {
  const { username, key } = req.body;
  if (!username || !key) return res.status(400).json({ error: "Username or key missing" });

  userKeys[username] = key;
  console.log(`🔑 Stored API key for user: ${username}`);
  res.json({ status: "ok", saved: true });
});

// Check if user has an API key
app.get("/api/checkKey", (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "Username missing" });

  const key = userKeys[username] || null;
  res.json({ 
    hasKey: !!key,
    apiKey: key // <-- now returns the stored API key
  });
});

// ======================
// ----- Boot -----
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

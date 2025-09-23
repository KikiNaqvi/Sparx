const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// ----- Message System -----
let latestMessage = "";
let latestTimestamp = 0; // store Unix time in ms

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

// Utility: auto-disable events except countdown
function setEventAutoDisable(eventName, time = null) {
  events[eventName] = {
    enabled: true,
    time: time,
    updated: Date.now(),
  };

  console.log(`🎉 Event set: ${eventName} ${time ? `(time: ${time})` : ""}`);

  // Auto-disable all except countdown
  if (eventName !== "countdown") {
    setTimeout(() => {
      if (events[eventName]) {
        events[eventName].enabled = false;
        console.log(`⏱️ Event automatically disabled: ${eventName}`);
      }
    }, 60000); // 1 minute
  }
}

// ----- Set Event Endpoint -----
app.post("/api/setevent", (req, res) => {
  const { event, time } = req.body;
  if (!event) return res.status(400).json({ error: "No event name provided" });

  setEventAutoDisable(event, time);
  res.json({ status: "ok", event: events[event] });
});

// ----- Get Events Endpoint -----
app.get("/api/events", (req, res) => {
  res.json(events);
});

// ----- Clear All Events -----
app.post("/api/clearevents", (req, res) => {
  events = {};
  console.log("🛑 All events cleared");
  res.json({ status: "ok", cleared: true });
});

// ----- Boot -----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

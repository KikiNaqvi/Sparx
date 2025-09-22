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

app.post("/api/setevent", (req, res) => {
  const { event, time } = req.body;
  if (!event) return res.status(400).json({ error: "No event name provided" });

  events[event] = {
    enabled: true,
    time: time || null,
    updated: Date.now(),
  };

  console.log(`🎉 Event set: ${event} ${time ? `(time: ${time})` : ""}`);
  res.json({ status: "ok", event: events[event] });
});

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

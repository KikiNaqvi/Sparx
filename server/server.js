// ====== server.js ======
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const multer = require("multer");
const path = require("path");

app.use(cors());
app.use(express.json());

// ====== MongoDB Connection ======
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ====== Mongoose Schema ======
const userKeySchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  key: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const UserKey = mongoose.model("UserKey", userKeySchema);

// ====== Message System ======
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

// ====== Event System ======
let events = {};

function setEventAutoDisable(eventName, time = null) {
  events[eventName] = {
    enabled: true,
    time: time,
    updated: Date.now(),
  };

  console.log(`🎉 Event set: ${eventName} ${time ? `(time: ${time})` : ""}`);

  if (eventName !== "countdown") {
    setTimeout(() => {
      const duration = eventName === "custom-image" ? 5000 : 60000;
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

// ====== Multiplayer Drawing ======
let drawingStrokes = [];

app.post("/api/draw", (req, res) => {
  const { stroke } = req.body;
  if (!stroke) return res.status(400).json({ error: "No stroke data provided" });

  drawingStrokes.push(stroke);
  if (drawingStrokes.length > 500) drawingStrokes.shift();
  res.json({ status: "ok" });
});

app.get("/api/draw", (req, res) => res.json(drawingStrokes));

app.post("/api/draw/clear", (req, res) => {
  drawingStrokes = [];
  console.log("🧹 Drawing canvas cleared");
  res.json({ status: "ok", cleared: true });
});

// ====== 🔑 User API Key System (MongoDB) ======
app.post("/api/saveKey", async (req, res) => {
  const { username, key } = req.body;
  if (!username || !key) return res.status(400).json({ error: "Missing username or key" });

  try {
    await UserKey.findOneAndUpdate({ username }, { key }, { upsert: true });
    console.log(`🔑 Saved key for ${username}`);
    res.json({ status: "ok", saved: true });
  } catch (err) {
    console.error("❌ Error saving key:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/checkKey", async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: "Username missing" });

  try {
    const found = await UserKey.findOne({ username });
    res.json({ hasKey: !!found, apiKey: found?.key || null });
  } catch (err) {
    console.error("❌ Error checking key:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/testMongo", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: "✅ MongoDB connected successfully!" });
  } catch (err) {
    console.error("❌ MongoDB ping error:", err);
    res.status(500).json({ error: "MongoDB not connected" });
  }
});

// ====== Image Upload Handling ======
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.post("/api/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  console.log("📸 Image uploaded:", imageUrl);
  res.json({ url: imageUrl });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====== Boot ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

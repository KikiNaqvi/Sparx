const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let latestMessage = "";
let latestTimestamp = 0; // store Unix time in ms

app.post("/msg/send", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  latestMessage = message;
  latestTimestamp = Date.now();
  console.log(`New broadcast at ${new Date(latestTimestamp).toISOString()}:`, message);
  res.json({ status: "ok" });
});

app.get("/msg/latest", (req, res) => {
  res.json({ message: latestMessage, timestamp: latestTimestamp });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

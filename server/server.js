const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();

app.set('trust proxy', 1);

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ====== MIDDLEWARE ======

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ====== ENVIRONMENT CHECK ======

if (
  !process.env.MONGO_URI ||
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.SESSION_SECRET ||
  !process.env.FRONTEND_ORIGIN
) {
  throw new Error("Missing required environment variables!");
}

// ====== MONGODB CONNECTION ======

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));


// ==================================================
// GOOGLE AUTHENTICATION
// ==================================================

const googleUserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  name: String,
  picture: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const GoogleUser = mongoose.model("GoogleUser", googleUserSchema);


// ====== AUTHENTICATION MIDDLEWARE (BEARER TOKEN) ======

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.SESSION_SECRET
    );

    const user = await GoogleUser.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}


// ====== GOOGLE SIGN IN ======

app.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Google credential missing" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      !payload.email_verified
    ) {
      return res.status(401).json({ error: "Invalid Google account" });
    }

    let user = await GoogleUser.findOne({
      googleId: payload.sub
    });

    if (!user) {
      user = await GoogleUser.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      });
    } else {
      user.email = payload.email;
      user.name = payload.name;
      user.picture = payload.picture;
      await user.save();
    }

    const sessionToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.SESSION_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token: sessionToken,
      user: {
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    });

  } catch (err) {
    return res.status(401).json({
      error: "Google authentication failed: " + err.message
    });
  }
});


// ====== CHECK LOGIN ======

app.get("/auth/me", authenticate, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture
    }
  });
});


// ====== LOGOUT ======

app.post("/auth/logout", (req, res) => {
  res.json({ success: true });
});


// ==================================================
// MESSAGE SYSTEM
// ==================================================

let latestMessage = "";
let latestTimestamp = 0;

app.post("/msg/send", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  latestMessage = message;
  latestTimestamp = Date.now();

  res.json({
    status: "ok",
    message,
    timestamp: latestTimestamp
  });
});

app.get("/msg/latest", (req, res) => {
  res.json({
    message: latestMessage,
    timestamp: latestTimestamp
  });
});


// ==================================================
// EVENT SYSTEM
// ==================================================

let events = {};

app.post("/api/setevent", (req, res) => {
  const { event, time, url, code } = req.body;

  if (!event) {
    return res.status(400).json({ error: "No event name provided" });
  }

  events[event] = {
    enabled: true,
    time: time || null,
    updated: Date.now(),
    url: url || null,
    code: code || null
  };

  const duration =
    event === "custom-image"
      ? 5000
      : event === "countdown"
        ? null
        : 60000;

  if (duration) {
    setTimeout(() => {
      if (events[event]) {
        events[event].enabled = false;
      }
    }, duration);
  }

  res.json({
    status: "ok",
    event: events[event]
  });
});

app.get("/api/events", (req, res) => {
  res.json(events);
});

app.post("/api/clearevents", (req, res) => {
  events = {};
  res.json({ status: "ok", cleared: true });
});


// ==================================================
// MULTIPLAYER DRAWING
// ==================================================

let drawingStrokes = [];

app.post("/api/draw", (req, res) => {
  const { stroke } = req.body;

  if (!stroke) {
    return res.status(400).json({ error: "No stroke data provided" });
  }

  drawingStrokes.push(stroke);

  if (drawingStrokes.length > 500) {
    drawingStrokes.shift();
  }

  res.json({ status: "ok" });
});

app.get("/api/draw", (req, res) => {
  res.json(drawingStrokes);
});

app.post("/api/draw/clear", (req, res) => {
  drawingStrokes = [];
  res.json({ status: "ok", cleared: true });
});


// ==================================================
// USER API KEY SYSTEM
// ==================================================

const userKeySchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  keys: {
    type: [String],
    default: () => [null, null, null, null, null]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserKey = mongoose.model("UserKey", userKeySchema);


// ====== SAVE API KEY ======

app.post("/api/saveKey", authenticate, async (req, res) => {
  const { key, index } = req.body;

  if (
    typeof key !== "string" ||
    !key.trim() ||
    !Number.isInteger(index) ||
    index < 0 ||
    index > 4
  ) {
    return res.status(400).json({ error: "Invalid key or index" });
  }

  try {
    let user = await UserKey.findOne({
      username: req.user.email
    });

    if (!user) {
      user = new UserKey({
        username: req.user.email,
        keys: [null, null, null, null, null]
      });
    }

    user.keys[index] = key.trim();
    await user.save();

    res.json({
      status: "ok",
      saved: true,
      keys: user.keys
    });

  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});


// ====== CHECK API KEYS ======

app.get("/api/checkKey", authenticate, async (req, res) => {
  try {
    const user = await UserKey.findOne({
      username: req.user.email
    });

    res.json({
      hasKey: !!user,
      keys: user?.keys || [null, null, null, null, null]
    });

  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});


// ==================================================
// MONGODB TEST
// ==================================================

app.get("/api/testMongo", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: "✅ MongoDB connected successfully!" });
  } catch (err) {
    res.status(500).json({ error: "MongoDB not connected" });
  }
});


// ==================================================
// SERVER BOOT
// ==================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

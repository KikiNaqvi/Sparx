
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();

// REQUIRED on Render/Heroku/Cloudflare so secure cookies work properly behind a proxy
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

// ====== GOOGLE USER MODEL ======

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

const GoogleUser = mongoose.model(
  "GoogleUser",
  googleUserSchema
);


// ====== AUTHENTICATION MIDDLEWARE ======

async function authenticate(req, res, next) {
  try {
    const token = req.cookies.session;

    if (!token) {
      return res.status(401).json({
        error: "Not authenticated"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.SESSION_SECRET
    );

    const user = await GoogleUser.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: "User not found"
      });
    }

    req.user = user;

    next();

  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired session"
    });
  }
}


// ====== GOOGLE SIGN IN (WITH DETAILED LOGS) ======
app.post("/auth/google", async (req, res) => {
  console.log("📥 Incoming POST /auth/google request received");
  
  try {
    const { credential } = req.body;

    if (!credential) {
      console.log("❌ Error: Google credential missing in request body");
      return res.status(400).json({ error: "Google credential missing" });
    }

    console.log("🔍 Verifying Google ID token with Google API...");
    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    console.log("✅ Google token verified successfully for email:", payload?.email);

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      !payload.email_verified
    ) {
      console.log("❌ Error: Invalid Google payload or unverified email:", payload);
      return res.status(401).json({ error: "Invalid Google account" });
    }

    console.log("🔍 Searching MongoDB for existing GoogleUser with googleId:", payload.sub);
    // Find or create account
    let user = await GoogleUser.findOne({
      googleId: payload.sub
    });

    if (!user) {
      console.log("👤 User not found in MongoDB. Creating new user record...");
      user = await GoogleUser.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      });

      console.log("🆕 Successfully created new Google user in DB:", user.email);

    } else {
      console.log("👋 Existing user found. Updating profile fields...");
      user.email = payload.email;
      user.name = payload.name;
      user.picture = payload.picture;

      await user.save();
      console.log("💾 Successfully updated returning user:", user.email);
    }

    // Generate session
    console.log("🔑 Generating JWT session token...");
    const sessionToken = jwt.sign(
      {
        userId: user._id.toString()
      },
      process.env.SESSION_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // Store session in secure cookie
    console.log("🍪 Setting 'session' cookie in response headers...");
    res.cookie("session", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    console.log("🚀 Google sign-in flow completed successfully!");
    return res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    });

  } catch (err) {
    console.error("❌ CRITICAL ERROR in /auth/google route:");
    console.error("Error Message:", err.message);
    console.error("Stack Trace:", err.stack);

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
  res.clearCookie("session", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/"
  });

  res.json({
    success: true
  });
});


// ==================================================
// MESSAGE SYSTEM
// ==================================================

let latestMessage = "";
let latestTimestamp = 0;

app.post("/msg/send", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "No message provided"
    });
  }

  latestMessage = message;
  latestTimestamp = Date.now();

  console.log(
    `💌 New broadcast at ${new Date(latestTimestamp).toISOString()}:`,
    message
  );

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
    return res.status(400).json({
      error: "No event name provided"
    });
  }

  events[event] = {
    enabled: true,
    time: time || null,
    updated: Date.now(),
    url: url || null,
    code: code || null
  };

  console.log(
    `🎉 Event set: ${event} ${url ? `(image: ${url})` : ""}`
  );

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
        console.log(`⏱️ Event automatically disabled: ${event}`);
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

  console.log("🛑 All events cleared");

  res.json({
    status: "ok",
    cleared: true
  });
});


// ==================================================
// MULTIPLAYER DRAWING
// ==================================================

let drawingStrokes = [];

app.post("/api/draw", (req, res) => {
  const { stroke } = req.body;

  if (!stroke) {
    return res.status(400).json({
      error: "No stroke data provided"
    });
  }

  drawingStrokes.push(stroke);

  if (drawingStrokes.length > 500) {
    drawingStrokes.shift();
  }

  res.json({
    status: "ok"
  });
});

app.get("/api/draw", (req, res) => {
  res.json(drawingStrokes);
});

app.post("/api/draw/clear", (req, res) => {
  drawingStrokes = [];

  console.log("🧹 Drawing canvas cleared");

  res.json({
    status: "ok",
    cleared: true
  });
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
    !Number.isInteger(index)
  ) {
    return res.status(400).json({
      error: "Invalid key or index"
    });
  }

  if (index < 0 || index > 4) {
    return res.status(400).json({
      error: "Invalid index (must be 0-4)"
    });
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

    console.log(
      `🔑 Saved key #${index + 1} for ${req.user.email}`
    );

    res.json({
      status: "ok",
      saved: true,
      keys: user.keys
    });

  } catch (err) {
    console.error("❌ Error saving key:", err);

    res.status(500).json({
      error: "Database error"
    });
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
    console.error("❌ Error checking key:", err);

    res.status(500).json({
      error: "Database error"
    });
  }
});


// ==================================================
// MONGODB TEST
// ==================================================

app.get("/api/testMongo", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();

    res.json({
      status: "✅ MongoDB connected successfully!"
    });

  } catch (err) {
    console.error("❌ MongoDB ping error:", err);

    res.status(500).json({
      error: "MongoDB not connected"
    });
  }
});


// ==================================================
// SERVER BOOT
// ==================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

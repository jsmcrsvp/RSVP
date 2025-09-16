//=================== Load Dependencies ===================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

//=================== CORS Configuration ===================
const corsOptions = {
  origin: [
    "https://jsmcrsvp.onrender.com", // frontend
    "http://localhost:3000",         // local dev
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS globally
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight

// Body parser
app.use(express.json());

//=================== MongoDB Connection ===================
const MONGODB_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const Member = require("./models/Members_DB_Schema");

// Auto-reconnect on disconnect
mongoose.connection.on("disconnected", async () => {
  console.log("🔄 MongoDB disconnected! Attempting to reconnect...");
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB reconnected!");
  } catch (error) {
    console.error("❌ MongoDB reconnection failed:", error);
  }
});

//=================== Health Check ===================
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

//=================== Member Routes ===================
app.post("/search_member", async (req, res) => {
  const { memberId, name, houseNumber } = req.body;
  console.log("server.js/search_member: Member ", memberId, name, houseNumber);
  try {
    let member;

    if (memberId) {
      member = await Member.findOne({ memberId });
    } else if (name && houseNumber) {
      member = await Member.findOne({
        fullName: { $regex: new RegExp(name, "i") },
        address: { $regex: new RegExp(houseNumber, "i") },
      });
    } else {
      return res.status(400).json({ message: "Provide Member ID or Name + House Number" });
    }

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.json({
      memberId: member.memberId,
      name: member.fullName,
      address: member.address,
      phone: member.phoneNumber,
    });
  } catch (error) {
    console.error("❌ Internal server error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//=================== Dashboard ===================
app.get("/api/dashboard-stats", async (req, res) => {
  try {
    const events = await RSVPCollection.aggregate([
      {
        $group: {
          _id: { eventname: "$eventname" },
          total: { $sum: 1 },
          yes: { $sum: { $cond: [{ $eq: ["$vote", "Yes"] }, 1, 0] } },
          no: { $sum: { $cond: [{ $eq: ["$vote", "No"] }, 1, 0] } },
          maybe: { $sum: { $cond: [{ $eq: ["$vote", "Maybe"] }, 1, 0] } },
        },
      },
    ]);

    res.json(
      events.map((e) => ({
        eventname: e._id.eventname,
        total: e.total,
        yes: e.yes,
        no: e.no,
        maybe: e.maybe,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching stats");
  }
});

//=================== Program Routes ===================
// Import routes
const programRoutes = require("./routes/programs");
const rsvpRoutes = require("./routes/rsvp");
const dashboardRoutes = require("./routes/dashboard");
const addEventsRoutes = require("./routes/addEvents");
const addProgramsRoutes = require("./routes/addPrograms");

// Mount routes
app.use("/api/programs", programRoutes);
app.use("/api/rsvp_response", rsvpRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/add_events", addEventsRoutes);
app.use("/api/add_programs", addProgramsRoutes);

// =================== Global JSON Error Handler ===================
app.use((err, req, res, next) => {
  console.error("🔥 Uncaught error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// Health check
app.get("/", (req, res) => res.send("Backend is running ✅"));
//=================== Server Init ===================
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

//=====================================================================================================
/*async function logEvent(action, details = '') {
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
  console.log ();
  //const logMessage = `[${timestamp}] ${action} - ${details}`;
  await EventLog.create({ logEntry: logMessage });
}*/
//=====================================================================================================
app.get("/server-keep-alive", async (req, res) => {
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
  console.log("✅ Server auto keep-alive triggered", timestamp);
  //await logEvent('Keep-Alive', `Server`);
  res.status(200).json({ success: true, message: "Server is alive!" });
});


app.get("/test-db-write", async (req, res) => {
  try {
    const EventsList = require("./models/Events_List_DB_Schema");
    const test = new EventsList({ event_name: "Test Event" });
    const saved = await test.save();
    console.log("✅ Test DB write:", saved);
    res.json({ success: true, saved });
  } catch (err) {
    console.error("❌ DB write failed:", err);
    res.status(500).json({ error: "DB write failed" });
  }
});


/* ==============Working 090325 - 3:45pm ==============
//=================== Load Dependencies ===================
require("dotenv").config(); // load only your .env
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

//=================== CORS Configuration ===================
const corsOptions = {
  origin: [
    "https://jsmcrsvp.onrender.com", // frontend
    "http://localhost:3000",         // local dev
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS globally
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight

// Body parser
app.use(express.json());

//=================== MongoDB Connection ===================
const MONGODB_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const Member = require("./models/Members_DB_Schema");

// Auto-reconnect on disconnect
mongoose.connection.on("disconnected", async () => {
  console.log("🔄 MongoDB disconnected! Attempting to reconnect...");
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB reconnected!");
  } catch (error) {
    console.error("❌ MongoDB reconnection failed:", error);
  }
});

// Example test route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

//=================== Routes ===================
app.post("/search_member", async (req, res) => {
  const { memberId, name, houseNumber } = req.body;
    console.log("server.js/search_member: Member ", memberId, name, houseNumber);
  try {
    let member;

    if (memberId) {
        console.log("server.js/search_member: Searching by Member ID ", memberId);
      //console.log("🔍 Searching by Member ID:", memberId);
      member = await Member.findOne({ memberId });
    } else if (name && houseNumber) {
      console.log("🔍 server.js/search_member:Searching by Name + House Number:", name, houseNumber);
      // Match name (case-insensitive) and address containing house number
      member = await Member.findOne({
        fullName: { $regex: new RegExp(name, "i") },
        address: { $regex: new RegExp(houseNumber, "i") }
      });
    } else {
      return res.status(400).json({ message: "Provide Member ID or Name + House Number" });
    }

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.json({
        memberId: member.memberId,
        name: member.fullName,
        address: member.address,
        phone: member.phoneNumber
    });

  } catch (error) {
    console.error("❌ Internal server error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Use Render’s PORT (fallback to 3001 locally)
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
*/



/*
//=================== Load Dependencies ===================
require("dotenv").config(); // load only your .env
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

//=================== CORS Configuration ===================
const corsOptions = {
  origin: [
    "https://jsmcrsvp.onrender.com", // frontend
    "http://localhost:3000",         // local dev
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS globally
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight

// Body parser
app.use(express.json());

//=================== MongoDB Connection ===================
const MONGODB_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const Member = require("./models/Members_DB_Schema");

// Auto-reconnect on disconnect
mongoose.connection.on("disconnected", async () => {
  console.log("🔄 MongoDB disconnected! Attempting to reconnect...");
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB reconnected!");
  } catch (error) {
    console.error("❌ MongoDB reconnection failed:", error);
  }
});

//=================== Routes ===================
app.post("/search_member", async (req, res) => {
  const { memberId } = req.body;
    console.log("server.js/search_member: Member ID ", memberId);

  try {
    const member = await Member.findOne({ memberId });

    if (!member) {
      return res.status(401).json({ message: "Invalid Member ID" });
    }

    return res.json({
      name: member.fullName,
      address: member.address,
      phone: member.phoneNumber
    });

  } catch (error) {
    console.error("Internal server error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//=================== Health Check ===================
app.get("/", (req, res) => res.send("✅ Server running"));

//=================== Server Init ===================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
*/
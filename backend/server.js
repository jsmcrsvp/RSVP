//=================== Load Dependencies ===================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

const Program = require ("./models/Programs_DB_Schema");
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

//const Member = require("./models/Members_DB_Schema"); Commented 10/1

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

/*========== Search Member =========== Not used anymore from here ======
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
*/

/* =======Troubleshooting module ============
app.use((req, res, next) => {
  console.log(`➡️ Incoming: ${req.method} ${req.url}`);
  next();
});*/

//=================== Program Routes ===================
// Import routes
const searchMemberRoute = require("./routes/searchMember");
const programRoutes = require("./routes/programs");
const rsvpRoutes = require("./routes/rsvp");
const dashboardRoutes = require("./routes/dashboard");
const addEventsRoutes = require("./routes/addEvents");
const addProgramsRoutes = require("./routes/addPrograms");
const reportRoutes = require("./routes/report");
const clearRSVPRoutes = require("./routes/clearrsvp");
const updateDatabaseRoutes = require("./routes/updateDatabase");


// Mount routes
app.use("/api/searchMember", searchMemberRoute);
app.use("/api/programs", programRoutes);
app.use("/api/rsvp_response", rsvpRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/add_events", addEventsRoutes);
app.use("/api/add_programs", addProgramsRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/clearrsvp", clearRSVPRoutes);
app.use("/api/updateDatabase", updateDatabaseRoutes);

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

app.get("/auto-close-rsvp", async (req, res) => {
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  console.log("⏰ Auto-close RSVP check triggered:", timestamp);

  try {
    const today = new Date();
    const programs = await Program.find();

    let totalClosed = 0;

    for (const program of programs) {
      let updated = false;

      program.progevent.forEach((ev) => {
        if (!ev.closersvp) return; // skip if no close date
        const closeDate = new Date(ev.closersvp);

        if (closeDate < today && ev.eventstatus !== "Closed") {
          console.log(`🔒 Closing event "${ev.eventname}" (${ev.eventdate}) for program "${program.progname}"`);
          ev.eventstatus = "Closed";
          updated = true;
          totalClosed++;
        }
      });

      if (updated) await program.save();
    }

    console.log(`✅ Auto-close complete — ${totalClosed} event(s) closed.`);
    res.status(200).json({
      success: true,
      message: `Auto-close completed. ${totalClosed} event(s) closed.`,
      timestamp,
    });
  } catch (err) {
    console.error("❌ Error in auto-close:", err);
    res.status(500).json({ success: false, message: "Error during auto-close.", error: err.message });
  }
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
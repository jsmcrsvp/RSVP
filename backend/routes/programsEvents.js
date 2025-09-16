// backend/routes/programsEvents.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Program = require("../models/program_list");
const Event = require("../models/events_list");

// ✅ Helper to send consistent JSON error
function sendError(res, message, status = 400) {
  return res.status(status).json({ success: false, error: message });
}

// ======================= CREATE PROGRAM =======================
router.post("/programs", async (req, res) => {
  try {
    const { program_name } = req.body;

    if (!program_name || typeof program_name !== "string" || !program_name.trim()) {
      return sendError(res, "Program name is required");
    }

    // Check for duplicates
    const exists = await Program.findOne({ program_name: program_name.trim() });
    if (exists) {
      return sendError(res, "Program already exists", 409);
    }

    const newProgram = new Program({ program_name: program_name.trim() });
    await newProgram.save();

    res.json({ success: true, data: newProgram });
  } catch (err) {
    console.error("Error adding program:", err);
    sendError(res, "Failed to add program", 500);
  }
});

// ======================= GET ALL PROGRAMS =======================
router.get("/programs", async (req, res) => {
  try {
    const programs = await Program.find();
    res.json({ success: true, data: programs });
  } catch (err) {
    console.error("Error fetching programs:", err);
    sendError(res, "Failed to fetch programs", 500);
  }
});

// ======================= CREATE EVENT =======================
router.post("/events", async (req, res) => {
  try {
    const { event_name } = req.body;

    if (!event_name || typeof event_name !== "string" || !event_name.trim()) {
      return sendError(res, "Event name is required");
    }

    // Check for duplicates
    const exists = await Event.findOne({ event_name: event_name.trim() });
    if (exists) {
      return sendError(res, "Event already exists", 409);
    }

    const newEvent = new Event({ event_name: event_name.trim() });
    await newEvent.save();

    res.json({ success: true, data: newEvent });
  } catch (err) {
    console.error("Error adding event:", err);
    sendError(res, "Failed to add event", 500);
  }
});

// ======================= GET ALL EVENTS =======================
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ success: true, data: events });
  } catch (err) {
    console.error("Error fetching events:", err);
    sendError(res, "Failed to fetch events", 500);
  }
});

// ======================= GET BY ID (PROGRAM/ EVENT) =======================
router.get("/programs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid program ID");
    }

    const program = await Program.findById(id);
    if (!program) {
      return sendError(res, "Program not found", 404);
    }

    res.json({ success: true, data: program });
  } catch (err) {
    console.error("Error fetching program by ID:", err);
    sendError(res, "Failed to fetch program", 500);
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid event ID");
    }

    const event = await Event.findById(id);
    if (!event) {
      return sendError(res, "Event not found", 404);
    }

    res.json({ success: true, data: event });
  } catch (err) {
    console.error("Error fetching event by ID:", err);
    sendError(res, "Failed to fetch event", 500);
  }
});

module.exports = router;


/*
const express = require("express");
const router = express.Router();
const ProgramsList = require("../models/Programs_List_DB_Schema");
const EventsList = require("../models/Events_List_DB_Schema");

// Add new Program & Event in one request
router.post("/", async (req, res) => {
  try {
    const { program_name, event_name } = req.body;
    console.log("📥 POST /api/programs_events", { program_name, event_name });

    if (!program_name && !event_name) {
      return res.status(400).json({ error: "Program or Event name required" });
    }

    let savedProgram = null;
    let savedEvent = null;

    if (program_name?.trim()) {
      console.log("➡️ Saving program:", program_name);
      const newProgram = new ProgramsList({ program_name });
      savedProgram = await newProgram.save();
    }

    if (event_name?.trim()) {
      console.log("➡️ Saving event:", event_name);
      const newEvent = new EventsList({ event_name });
      savedEvent = await newEvent.save();
    }

    console.log("✅ Saved successfully:", { savedProgram, savedEvent });

    return res.status(201).json({
      message: "Program/Event saved successfully",
      program: savedProgram,
      event: savedEvent,
    });
  } catch (error) {
    console.error("❌ Error saving Program/Event:", error);
    return res.status(500).json({ error: "Failed to save Program/Event" });
  }
});

// Get all programs
router.get("/programs", async (req, res) => {
  try {
    const programs = await ProgramsList.find();
    res.json(programs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

// Get all events
router.get("/events", async (req, res) => {
  try {
    const events = await EventsList.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

module.exports = router;
*/

/* backend/routes/programsEvents.js
const express = require("express");
const router = express.Router();
const ProgramsList = require("../models/Programs_List_DB_Schema");
const EventsList = require("../models/Events_List_DB_Schema");

// Add new Program & Event in one request
router.post("/", async (req, res) => {
  try {
    const { program_name, event_name } = req.body;
    console.log("📥 POST /api/programs_events", { program_name, event_name });

    if (!program_name && !event_name) {
      return res.status(400).json({ error: "Program or Event name required" });
    }

    let savedProgram = null;
    let savedEvent = null;

    if (program_name?.trim()) {
      console.log("➡️ Saving program:", program_name);
      const newProgram = new ProgramsList({ program_name });
      savedProgram = await newProgram.save();
    }

    if (event_name?.trim()) {
      console.log("➡️ Saving event:", event_name);
      const newEvent = new EventsList({ event_name });
      savedEvent = await newEvent.save();
    }

    console.log("✅ Saved successfully:", { savedProgram, savedEvent });

    return res.status(201).json({
      message: "Program/Event saved successfully",
      program: savedProgram,
      event: savedEvent,
    });
  } catch (error) {
    console.error("Error saving Program/Event:", error);
    return res.status(500).json({ error: "Failed to save Program/Event" });
  }
});


// Get all programs
router.get("/programs", async (req, res) => {
  try {
    const programs = await ProgramsList.find().sort({ createdAt: -1 });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

// Get all events
router.get("/events", async (req, res) => {
  try {
    const events = await EventsList.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

module.exports = router;
*/
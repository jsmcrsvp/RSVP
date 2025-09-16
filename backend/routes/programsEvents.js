// backend/routes/programsEvents.js
const express = require("express");
const router = express.Router();
const ProgramList = require("../models/program_list");
const EventList = require("../models/events_list");

// Add new Program & Event
router.post("/", async (req, res) => {
  try {
    const { program_name, event_name } = req.body;

    if (!program_name && !event_name) {
      return res.status(400).json({ error: "Program or Event name required" });
    }

    let savedProgram = null;
    let savedEvent = null;

    if (program_name?.trim()) {
      const exists = await ProgramList.findOne({ program_name: program_name.trim() });
      if (exists) return res.status(400).json({ error: "Program already exists" });

      const newProgram = new ProgramList({ program_name: program_name.trim() });
      savedProgram = await newProgram.save();
    }

    if (event_name?.trim()) {
      const exists = await EventList.findOne({ event_name: event_name.trim() });
      if (exists) return res.status(400).json({ error: "Event already exists" });

      const newEvent = new EventList({ event_name: event_name.trim() });
      savedEvent = await newEvent.save();
    }

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
    const programs = await ProgramList.find().sort({ createdAt: -1 });
    res.json(programs);
  } catch (error) {
    console.error("❌ Error fetching programs:", error);
    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

// Get all events
router.get("/events", async (req, res) => {
  try {
    const events = await EventList.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
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
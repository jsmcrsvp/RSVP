// backend/routes/programsEvents.js
const express = require("express");
const router = express.Router();
const ProgramsList = require("../models/Programs_List_DB_Schema");
const EventsList = require("../models/Events_List_DB_Schema");

// Add new Program & Event in one request
router.post("/", async (req, res) => {
  try {
    const { program_name, event_name } = req.body;

    let savedProgram = null;
    let savedEvent = null;

    if (program_name && program_name.trim() !== "") {
      const newProgram = new ProgramsList({ program_name });
      savedProgram = await newProgram.save();
    }

    if (event_name && event_name.trim() !== "") {
      const newEvent = new EventsList({ event_name });
      savedEvent = await newEvent.save();
    }

    res.status(201).json({
      message: "Program/Event saved successfully",
      program: savedProgram,
      event: savedEvent,
    });
  } catch (error) {
    console.error("Error saving Program/Event:", error);
    res.status(500).json({ error: "Failed to save Program/Event" });
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

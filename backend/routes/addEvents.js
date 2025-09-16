const express = require("express");
const router = express.Router();
const AddEvent = require("../models/addEvent_DB_Schema");

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await AddEvent.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// POST new event
router.post("/", async (req, res) => {
  try {
    const { event_name } = req.body;

    if (!event_name || !event_name.trim()) {
      return res.status(400).json({ error: "Event name is required" });
    }

    // check for duplicates
    const exists = await AddEvent.findOne({ event_name: event_name.trim() });
    if (exists) return res.status(400).json({ error: "Event already exists" });

    const newEvent = new AddEvent({ event_name: event_name.trim() });
    const saved = await newEvent.save();

    res.status(201).json({ message: "Event saved successfully", event: saved });
  } catch (error) {
    console.error("❌ Error saving event:", error);
    res.status(500).json({ error: "Failed to save event" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const RsvpResponse = require("../models/Rsvp_Response_DB_Schema");
const Program = require("../models/Programs_DB_Schema");

// GET completed events
router.get("/completed-events", async (req, res) => {
  try {
    const completedEvents = await Program.find({ status: "Completed" }).select("event_name");
    res.json({ events: completedEvents });
  } catch (err) {
    console.error("Error fetching completed events:", err);
    res.status(500).json({ error: "Failed to fetch completed events" });
  }
});

// POST clear RSVP for selected event
router.post("/clear-rsvp", async (req, res) => {
  try {
    const { eventName } = req.body;
    if (!eventName) return res.status(400).json({ error: "Event name is required" });

    const result = await RsvpResponse.deleteMany({ eventname: eventName });
    res.json({ message: `Cleared ${result.deletedCount} RSVP(s) for "${eventName}"` });
  } catch (err) {
    console.error("Error clearing RSVP:", err);
    res.status(500).json({ error: "Failed to clear RSVP" });
  }
});

module.exports = router;

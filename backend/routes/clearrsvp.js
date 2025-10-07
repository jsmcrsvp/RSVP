const express = require("express");
const router = express.Router();
const RsvpResponse = require("../models/Rsvp_Response_DB_Schema");
const Program = require("../models/Programs_DB_Schema");

// Get completed event
router.get("/completed-event", async (req, res) => {
  try {
    const completedEvent = await Program.findOne({ status: "Completed" }).sort({ updatedAt: -1 });
    if (!completedEvent) return res.json({ eventName: null });
    res.json({ eventName: completedEvent.event_name });
  } catch (err) {
    console.error("Error fetching completed event:", err);
    res.status(500).json({ error: "Failed to fetch completed event" });
  }
});

// Clear RSVP for completed event
router.post("/clear", async (req, res) => {
  try {
    const completedEvent = await Program.findOne({ status: "Completed" }).sort({ updatedAt: -1 });
    if (!completedEvent) return res.status(404).json({ error: "No completed event found" });

    await RsvpResponse.deleteMany({ event_name: completedEvent.event_name });
    res.json({ message: "RSVP data cleared successfully" });
  } catch (err) {
    console.error("Error clearing RSVP data:", err);
    res.status(500).json({ error: "Failed to clear RSVP data" });
  }
});

module.exports = router;

// backend/routes/clearrsvp.js
const express = require("express");
const router = express.Router();
const Program = require("../models/Programs_DB_Schema");
const RsvpResponse = require("../models/Rsvp_Response_DB_Schema");

// ✅ Route 1: Get list of completed events
router.get("/completed-events", async (req, res) => {
    try {
        const programs = await Program.find({ "progevent.eventstatus": "Completed" });
        if (!programs || programs.length === 0) {
            return res.status(404).json({ message: "No completed events found" });
        }

        // Flatten out the completed events
        const completedEvents = [];
        programs.forEach((program) => {
            program.progevent.forEach((ev) => {
                if (ev.eventstatus === "Completed") {
                    completedEvents.push({
                         _id: `${program._id}_${ev._id}`,
                        programname: program.progname,
                        eventname: ev.eventname,
                        eventday: ev.eventday,
                        eventdate: ev.eventdate,
                    });
                }
            });
        });

        res.json(completedEvents);
    } catch (err) {
        console.error("❌ Error fetching completed events:", err);
        res.status(500).json({ message: "Server error while fetching completed events" });
    }
});

// ✅ Route 2: Clear RSVP responses for a completed event
// backend/routes/clearrsvp.js
router.post("/clear-rsvp", async (req, res) => {
    try {
        const { eventName } = req.body;
        if (!eventName) return res.status(400).json({ message: "eventName is required" });

        const deleted = await RsvpResponse.deleteMany({ eventname: eventName });
        res.json({
            message: `RSVP responses cleared for event '${eventName}'`,
            deletedCount: deleted.deletedCount,
        });
    } catch (err) {
        console.error("❌ Error clearing RSVP responses:", err);
        res.status(500).json({ message: "Server error while clearing RSVP responses" });
    }
});


module.exports = router;

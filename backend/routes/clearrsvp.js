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

    const completedEvents = [];

    for (const program of programs) {
      for (const ev of program.progevent) {
        if (ev.eventstatus === "Completed") {
          // Get total RSVP counts from RsvpResponse collection
          const rsvpCounts = await RsvpResponse.aggregate([
            { $match: { eventname: ev.eventname } },
            { $group: { _id: null, totalAdult: { $sum: "$rsvpcount" }, totalKids: { $sum: "$kidsrsvpcount" } } },
          ]);

          const totalAdult = rsvpCounts[0]?.totalAdult || 0;
          const totalKids = rsvpCounts[0]?.totalKids || 0;

          completedEvents.push({
            _id: `${program._id}_${ev._id}`,
            programname: program.progname,
            eventname: ev.eventname,
            eventday: ev.eventday,
            eventdate: ev.eventdate,
            totalRSVP: totalAdult + totalKids,
          });
        }
      }
    }

    res.json(completedEvents);
  } catch (err) {
    console.error("❌ Error fetching completed events:", err);
    res.status(500).json({ message: "Server error while fetching completed events" });
  }
});


// ✅ Route 2: Clear RSVP responses for a completed event
router.post("/clear-rsvp", async (req, res) => {
  try {
    const { eventName } = req.body;
    if (!eventName) return res.status(400).json({ message: "eventName is required" });

    // Delete RSVP responses
    const deleted = await RsvpResponse.deleteMany({ eventname: eventName });

    // Check if any RSVP responses remain
    const remainingRSVP = await RsvpResponse.countDocuments({ eventname: eventName });

    // If none remain, delete the event from Program collection
    if (remainingRSVP === 0) {
      await Program.updateMany(
        {},
        { $pull: { progevent: { eventname: eventName } } }
      );
    }

    res.json({
      message: `RSVP responses cleared for event '${eventName}'`,
      deletedCount: deleted.deletedCount,
      eventDeleted: remainingRSVP === 0, // flag frontend can use if needed
    });
  } catch (err) {
    console.error("❌ Error clearing RSVP responses:", err);
    res.status(500).json({ message: "Server error while clearing RSVP responses" });
  }
});



module.exports = router;

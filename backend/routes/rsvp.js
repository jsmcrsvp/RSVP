// backend/routes/rsvp.js
const express = require("express");
const router = express.Router();
const RSVP = require("../models/rsvp"); // Mongoose schema for RSVP collection

// POST /api/rsvp
router.post("/", async (req, res) => {
  try {
    const {
      memname,
      memaddress,
      memphonenumber,
      rsvpconfnumber,
      events,
    } = req.body;

    if (!memname || !memaddress || !memphonenumber || !rsvpconfnumber) {
      return res.status(400).json({ error: "Missing required member details." });
    }

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: "No events selected." });
    }

    // Create RSVP documents for each event with the same confirmation #
    const rsvpDocs = events.map((ev) => ({
      memname,
      memaddress,
      memphonenumber,
      rsvpconfnumber,
      programname: ev.programname,
      eventname: ev.eventname,
      eventday: ev.eventday,
      eventdate: ev.eventdate,
      rsvpcount: ev.rsvpcount,
    }));

    await RSVP.insertMany(rsvpDocs);

    res.status(201).json({
      message: "RSVP submitted successfully.",
      confirmation: rsvpconfnumber,
      eventsCount: rsvpDocs.length,
    });
  } catch (err) {
    console.error("Error submitting RSVP:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;



/* backend/routes/rsvp.js
const express = require("express");
const router = express.Router();
const RsvpResponse = require("../models/Rsvp_Response_DB_Schema");

// POST: Save RSVP
router.post("/", async (req, res) => {
  try {
    const {
      eventdate,
      eventday,
      memname,
      memaddress,
      memphonenumber,
      rsvpcount,
      rsvpconfnumber,
      eventname,
      programname,
    } = req.body;

    // Validate required fields
    if (!eventdate || !eventday || !memname || !rsvpcount || !rsvpconfnumber || !eventname || !programname) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newRSVP = new RsvpResponse({
      eventdate,
      eventday,
      memname,
      memaddress,
      memphonenumber,
      rsvpcount,
      rsvpconfnumber,
      eventname,
      programname,
    });

    await newRSVP.save();

    res.status(201).json({ message: "RSVP saved successfully", rsvp: newRSVP });
  } catch (err) {
    console.error("❌ Error saving RSVP:", err);
    res.status(500).json({ message: "Error saving RSVP", error: err.message });
  }
});

module.exports = router;
*/
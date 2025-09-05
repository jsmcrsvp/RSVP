// backend/routes/rsvp.js
const express = require("express");
const router = express.Router();
const RsvpResponse = require("../models/Rsvp_Response_DB_Schema");

// POST: Save RSVP(s)
router.post("/", async (req, res) => {
  try {
    const {
      eventdate,
      eventday,
      memname,
      memaddress,
      memphonenumber,
      rsvpconfnumber,
      events, // now expecting array of events with { eventname, programname, rsvpcount }
    } = req.body;

    // Validate required fields
    if (!eventdate || !eventday || !memname || !rsvpconfnumber || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Insert one RSVP record per event
    const newRsvps = events.map(ev => ({
      eventdate,
      eventday,
      memname,
      memaddress,
      memphonenumber,
      rsvpconfnumber,
      eventname: ev.eventname,
      programname: ev.programname,
      rsvpcount: ev.rsvpcount,
    }));

    const savedRsvps = await RsvpResponse.insertMany(newRsvps);

    res.status(201).json({
      message: "RSVP(s) saved successfully",
      rsvps: savedRsvps,
    });
  } catch (err) {
    console.error("❌ Error saving RSVP:", err);
    res.status(500).json({ message: "Error saving RSVP", error: err.message });
  }
});

// GET: Retrieve RSVP(s) by confirmation number
router.get("/:confNumber", async (req, res) => {
  try {
    const { confNumber } = req.params;

    if (!confNumber) {
      return res.status(400).json({ message: "Confirmation number required" });
    }

    const rsvps = await RsvpResponse.find({ rsvpconfnumber: confNumber });

    if (!rsvps || rsvps.length === 0) {
      return res.status(404).json({ message: "No RSVP found for this confirmation number" });
    }

    res.status(200).json({
      message: "RSVP(s) retrieved successfully",
      rsvps,
    });
  } catch (err) {
    console.error("❌ Error retrieving RSVP:", err);
    res.status(500).json({ message: "Error retrieving RSVP", error: err.message });
  }
});

module.exports = router;


/* backend/routes/rsvp.js
const express = require("express");
const router = express.Router();
const RSVP = require("../models/Rsvp_Response_DB_Schema");

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
*/


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
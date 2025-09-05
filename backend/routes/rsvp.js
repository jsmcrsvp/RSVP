// backend/routes/rsvp.js
const express = require("express");
const router = express.Router();
const RsvpResponse = require("../models/Rsvp_Response_DB_Schema");

// ✅ POST: Save RSVP (multiple events, one confirmation #)
router.post("/", async (req, res) => {
  try {
    const {
      memname,
      memaddress,
      memphonenumber,
      rsvpconfnumber,
      events,
    } = req.body;

    if (
      !memname ||
      !memaddress ||
      !memphonenumber ||
      !rsvpconfnumber ||
      !Array.isArray(events) ||
      events.length === 0
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Force confirmation number to string
    const confNumber = String(rsvpconfnumber);

    // Build RSVP docs for each event
    const newRsvps = events.map((ev) => {
      if (
        !ev.eventdate ||
        !ev.eventday ||
        !ev.eventname ||
        !ev.programname ||
        ev.rsvpcount === undefined
      ) {
        throw new Error("Missing required event fields");
      }
      return {
        eventdate: ev.eventdate,
        eventday: ev.eventday,
        eventname: ev.eventname,
        programname: ev.programname,
        rsvpcount: ev.rsvpcount,
        memname,
        memaddress,
        memphonenumber,
        rsvpconfnumber: confNumber,
      };
    });

    // Save to DB
    const savedRsvps = await RsvpResponse.insertMany(newRsvps);

    console.log("✅ Saved RSVP(s):", savedRsvps);
    console.log("Saved RSVP confirmation # type:", typeof savedRsvps[0].rsvpconfnumber);

    res.status(201).json({
      message: "RSVP saved successfully",
      confNumber,
      rsvps: savedRsvps,
    });
  } catch (err) {
    console.error("❌ Error saving RSVP:", err);
    res.status(500).json({ message: "Error saving RSVP", error: err.message });
  }
});

// ✅ GET: Verify RSVP by confirmation number
router.get("/:confNumber", async (req, res) => {
  try {
    const confNumber = String(req.params.confNumber);

    const rsvps = await RsvpResponse.find({ rsvpconfnumber: confNumber });

    if (!rsvps || rsvps.length === 0) {
      return res.status(404).json({ message: "RSVP not found" });
    }

    res.json({ confNumber, rsvps });
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
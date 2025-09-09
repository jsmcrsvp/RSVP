// backend/routes/rsvp.js
const express = require("express");
const router = express.Router();
const RsvpResponse = require("../models/Rsvp_Response_DB_Schema");
const Program = require("../models/Programs_DB_Schema"); // 👈 import Program schema

// POST: Save RSVP(s)
router.post("/", async (req, res) => {
    try {
        console.log("backend/routes/rsvp.js 📥 Incoming RSVP submission:", JSON.stringify(req.body, null, 2));

        let {
            memname,
            memaddress,
            memphonenumber,
            rsvpconfnumber,
            events,
        } = req.body;

        // ✅ Ensure confirmation number is stored as string
        rsvpconfnumber = String(rsvpconfnumber);

        // Validate required fields
        if (!memname || !rsvpconfnumber || !Array.isArray(events) || events.length === 0) {
            console.error("❌ Validation failed: Missing required fields");
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Insert one RSVP record per event
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
                rsvpconfnumber,
            };
        });

        const savedRsvps = await RsvpResponse.insertMany(newRsvps);

        console.log("backend/routes/rsvp.js ✅ RSVP saved successfully:", savedRsvps);

        res.status(201).json({
            message: "RSVP(s) saved successfully",
            rsvps: savedRsvps,
        });
    } catch (err) {
        console.error("❌ Error saving RSVP:", err);
        res.status(500).json({ message: "Error saving RSVP", error: err.message });
    }
});

// GET RSVP by confirmation number
router.get("/:confNumber", async (req, res) => {
  try {
    const { confNumber } = req.params;

    // Find RSVP entries
    const rsvps = await RsvpResponse.find({ rsvpconfnumber: confNumber });

    if (!rsvps || rsvps.length === 0) {
      return res.status(404).json({ error: "RSVP not found" });
    }

    // Enrich with eventstatus from Program collection
    const enrichedRsvps = await Promise.all(
      rsvps.map(async (rsvp) => {
        const program = await Program.findOne(
          { progname: rsvp.programname },
          { progevent: 1 }
        );

        let status = "Unknown";
        if (program) {
          const ev = program.progevent.find(
            (e) =>
              e.eventname === rsvp.eventname &&
              e.eventdate === rsvp.eventdate &&
              e.eventday === rsvp.eventday
          );
          if (ev) status = ev.eventstatus;
        }

        return {
          ...rsvp.toObject(),
          eventstatus: status,
        };
      })
    );

    res.json({ rsvps: enrichedRsvps });
  } catch (err) {
    console.error("Error fetching RSVP:", err);
    res.status(500).json({ error: "Server error fetching RSVP" });
  }
});

// GET: Retrieve RSVP(s) by confirmation number

/*router.get("/:confNumber", async (req, res) => {
    try {
        let { confNumber } = req.params;
        console.log(`backend/routes/rsvp.js 🔎 Looking up RSVP for confirmation number: ${confNumber}`);
        console.log("backend/routes/rsvp.js 📌 Type of confNumber param:", typeof confNumber);

        if (!confNumber) {
            return res.status(400).json({ message: "Confirmation number required" });
        }

        // ✅ Force to string for consistent lookup
        confNumber = String(confNumber);

        const rsvps = await RsvpResponse.find({ rsvpconfnumber: confNumber });

        if (!rsvps || rsvps.length === 0) {
            console.warn(`⚠️ No RSVP found for confirmation number: ${confNumber}`);
            return res.status(404).json({ message: "No RSVP found for this confirmation number" });
        }

        console.log(`backend/routes/rsvp.js ✅ Found ${rsvps.length} RSVP(s) for confirmation number: ${confNumber}`);

        res.status(200).json({
            message: "RSVP(s) retrieved successfully",
            rsvps,
        });
    } catch (err) {
        console.error("❌ Error retrieving RSVP:", err);
        res.status(500).json({ message: "Error retrieving RSVP", error: err.message });
    }
});
*/

// PUT /api/update_rsvp/:id
router.put("/update_rsvp/:id", async (req, res) => {
    const { id } = req.params;
    const { rsvpcount } = req.body;


    console.log("🔧 Received update request for RSVP ID:", id);
    console.log("🔢 New RSVP count:", rsvpcount);

    if (rsvpcount === undefined || isNaN(rsvpcount)) {
        return res.status(400).json({ message: "Invalid RSVP count." });
    }

    try {
        console.log("Updating RSVP ID:", id, "with count:", rsvpcount);
        const updated = await RsvpResponse.findByIdAndUpdate(
            id,
            { rsvpcount: parseInt(rsvpcount, 10) },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "RSVP record not found." });
        }

        console.log("Updated RSVP:", updated);
        res.json({ message: "RSVP updated successfully.", updated });
    } catch (err) {
        console.error("Error updating RSVP:", err);
        res.status(500).json({ message: "Server error." });
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
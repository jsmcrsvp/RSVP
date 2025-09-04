// backend/routes/programs.js

const express = require("express");
const router = express.Router();
const Program = require("../models/Programs_DB_Schema");

// =====================
// GET /api/programs/open
// Return all events with status "Open"
// =====================
router.get("/open", async (req, res) => {
  try {
    const programs = await Program.find({ "progevent.eventstatus": "Open" });

    let openEvents = [];
    programs.forEach((prog) => {
      prog.progevent.forEach((ev) => {
        if (ev.eventstatus === "Open") {
          openEvents.push({
            programname: prog.progname,
            eventname: ev.eventname,
            eventdate: ev.eventdate,
            eventday: ev.eventday,
            eventstatus: ev.eventstatus,
          });
        }
      });
    });

    res.json(openEvents);
  } catch (err) {
    console.error("❌ Error fetching open events:", err);
    res.status(500).json({ message: "Error fetching open events", error: err });
  }
});

// =====================
// POST /api/programs
// Add a new program with its events
// =====================
router.post("/programs", async (req, res) => {
  try {
    const { progname, progevent } = req.body;

    if (!progname || !Array.isArray(progevent) || progevent.length === 0) {
      return res.status(400).json({ message: "Program name and events are required" });
    }

    const program = new Program({ progname, progevent });
    await program.save();

    res.json(program);
  } catch (err) {
    console.error("❌ Error adding program:", err);
    res.status(500).json({ message: "Error adding program", error: err });
  }
});

module.exports = router;



/* ==========Working to add programs 090325 10:00pm ========
const express = require("express");
const Program = require("../models/Programs_DB_Schema");
const router = express.Router();

// POST /api/programs -> Add a new program with its first event
router.post("/", async (req, res) => {
  try {
    const { progname, progevent } = req.body;

    if (!progname || !progevent || progevent.length === 0) {
      return res.status(400).json({ message: "Program name and at least one event are required" });
    }

    const program = new Program({ progname, progevent });
    await program.save();

    return res.status(201).json({ message: "Program added successfully!", program });
  } catch (err) {
    console.error("Error adding program:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

module.exports = router;*/

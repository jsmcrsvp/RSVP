const express = require("express");
const Program = require("../models/Programs_DB_Schema");
const router = express.Router();

// ----------------- Add a new program with first event -----------------
router.post("/programs", async (req, res) => {
  try {
    const { progname, progevent } = req.body;

    const program = new Program({ progname, progevent });
    await program.save();

    res.json(program);
  } catch (err) {
    res.status(500).json({ message: "Error adding program", error: err });
  }
});

// ----------------- GET Open Events -----------------
router.get("/programs/open", async (req, res) => {
  try {
    // Find programs where at least one event has eventstatus "Open"
    const programs = await Program.find({
      "progevent.eventstatus": "Open",
    });

    // Flatten all open events and include program name
    const openEvents = [];
    programs.forEach((program) => {
      program.progevent.forEach((event) => {
        if (event.eventstatus === "Open") {
          openEvents.push({
            programname: program.progname,
            eventname: event.eventname,
            eventdate: event.eventdate,
            eventday: event.eventday,
            eventstatus: event.eventstatus,
          });
        }
      });
    });

    res.json(openEvents);
  } catch (err) {
    console.error("Error fetching open events:", err);
    res.status(500).json({ message: "Error fetching open events" });
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

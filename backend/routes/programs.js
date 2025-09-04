// GET /api/programs/open
router.get("/open", async (req, res) => {
  try {
    const programs = await Program.find({ "progevent.eventstatus": "Open" });
    // Flatten events to return array of open events with program info
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
    res.status(500).json({ message: "Error fetching open events", error: err });
  }
});



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

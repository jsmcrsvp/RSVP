const express = require("express");
const Program = require("../models/Programs_DB_Schema");

const router = express.Router();

// Add or update program with events
router.post("/", async (req, res) => {
  try {
    const { progname, progevent } = req.body;

    if (!progname || !progevent || !progevent.length) {
      return res.status(400).json({ message: "Program name and event are required" });
    }

    // Check if program already exists
    let program = await Program.findOne({ progname });

    if (program) {
      // ✅ Push event into existing program’s progevent array
      program.progevent.push(progevent[0]);
      await program.save();
      return res.status(200).json({ message: "Event added to existing program", program });
    }

    // ✅ If no program, create a new one
    program = new Program({ progname, progevent });
    await program.save();
    res.status(201).json({ message: "New program created with event", program });

  } catch (err) {
    console.error("Error adding program:", err);
    res.status(500).json({ message: "Server error adding program" });
  }
});


// Get all open events across programs
router.get("/open", async (req, res) => {
  try {
    const programs = await Program.find({
      "progevent.eventstatus": "Open"
    });

    // Flatten events with program name
    const openEvents = [];
    programs.forEach((prog) => {
      prog.progevent.forEach((ev) => {
        if (ev.eventstatus === "Open") {
          openEvents.push({
            programname: prog.progname,
            eventname: ev.eventname,
            eventdate: ev.eventdate,
            eventday: ev.eventday,
            eventstatus: ev.eventstatus,
            closersvp: ev.closersvp,
          });
        }
      });
    });

    res.json(openEvents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching open events" });
  }
});

// Get all closed events across programs
router.get("/closed", async (req, res) => {
  try {
    const programs = await Program.find({
      "progevent.eventstatus": "Closed"
    });

    // Flatten events with program name
    const closedEvents = [];
    programs.forEach((prog) => {
      prog.progevent.forEach((ev) => {
        if (ev.eventstatus === "Closed") {
          closedEvents.push({
            programname: prog.progname,
            eventname: ev.eventname,
            eventdate: ev.eventdate,
            eventday: ev.eventday,
            eventstatus: ev.eventstatus,
            eventclosersvp: ev.closersvp,
          });
        }
      });
    });

    res.json(closedEvents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching closed events" });
  }
});

// Get all programs with their events
router.get("/", async (req, res) => {
  try {
    const programs = await Program.find();
    res.json(programs);
  } catch (err) {
    console.error("Error fetching programs:", err);
    res.status(500).json({ message: "Failed to fetch programs" });
  }
});

// Update event status
router.put("/:progId/events/:evId/status", async (req, res) => {
  const { progId, evId } = req.params;
  const { eventstatus } = req.body;

  //console.log("➡️ Received request program.js with:", { progId, evId, eventstatus });
  try {
    const program = await Program.findById(progId);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    const event = program.progevent.id(evId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.eventstatus = eventstatus;
    await program.save();

    res.json({ message: "✅ Event status updated successfully", event });
  } catch (err) {
    console.error("Error updating event status:", err);
    res.status(500).json({ message: "❌ Server error" });
  }
});

module.exports = router;


// backend/routes/report.js
const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");

const RsvpResponse = require("../models/Rsvp_Response_DB_Schema");
const Programs = require("../models/Programs_DB_Schema");

// --- New route: Get all programs ---
router.get("/programs", async (req, res) => {
  try {
    const programs = await Programs.find({}, "progname eventstatus").sort({ progname: 1 });
    res.json(programs);
  } catch (err) {
    console.error("Error fetching programs:", err);
    res.status(500).json({ message: "Error fetching programs" });
  }
});

// --- New route: Get events for a program (Open/Closed only) ---
router.get("/events/:programName", async (req, res) => {
  try {
    const { programName } = req.params;
    const program = await Programs.findOne({ progname: programName });

    if (!program || !program.events) {
      return res.json([]); // no events for this program
    }

    // Filter Open or Closed events
    const filteredEvents = program.events.filter(
      (ev) => ev.eventstatus === "Open" || ev.eventstatus === "Closed"
    );

    res.json(filteredEvents);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Error fetching events" });
  }
});

module.exports = router;


// GET: Generate RSVP report for a given program + event
router.get("/download/:programName/:eventName", async (req, res) => {
  try {
    const { programName, eventName } = req.params;

    const responses = await RsvpResponse.find({
      programname: programName,
      eventname: eventName,
    });

    if (!responses.length) {
      return res.status(404).json({ message: "No RSVPs found for this event." });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("RSVP Report");

    worksheet.columns = [
      { header: "Member Name", key: "memname", width: 30 },
      { header: "Phone Number", key: "memphonenumber", width: 20 },
      { header: "Adult RSVP", key: "rsvpcount", width: 15 },
      { header: "Kids RSVP", key: "kidsrsvpcount", width: 15 },
    ];

    responses.forEach((rsvp) => {
      worksheet.addRow({
        memname: rsvp.memname,
        memphonenumber: rsvp.memphonenumber,
        rsvpcount: rsvp.rsvpcount,
        kidsrsvpcount: rsvp.kidsrsvpcount || 0,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=RSVP_Report_${programName}_${eventName}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ message: "Error generating report" });
  }
});

module.exports = router;

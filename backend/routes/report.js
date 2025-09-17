// backend/routes/report.js
const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");

const RsvpResponse = require("../models/Rsvp_Response_DB_Schema"); // RSVP collection
const Program = require("../models/Programs_DB_Schema");           // Programs collection

// --------------------------
// GET: All programs
// --------------------------
router.get("/programs", async (req, res) => {
  try {
    const programs = await Program.find({}, { progname: 1, _id: 0 });
    res.json(programs.map(p => p.progname));
  } catch (err) {
    console.error("Error fetching programs:", err);
    res.status(500).json({ message: "Error fetching programs" });
  }
});

// --------------------------
// GET: Events by program (status Open or Closed)
// --------------------------
router.get("/events/:programName", async (req, res) => {
  try {
    const { programName } = req.params;

    const program = await Program.findOne({ progname: programName });
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    // Filter events with status Open or Closed
    const events = (program.events || []).filter(ev => ["Open", "Closed"].includes(ev.eventstatus));
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Error fetching events" });
  }
});

// --------------------------
// GET: Download RSVP report for a given program + event
// --------------------------
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

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("RSVP Report");

    worksheet.columns = [
      { header: "Member Name", key: "memname", width: 30 },
      { header: "Phone Number", key: "memphonenumber", width: 20 },
      { header: "Adult RSVP", key: "rsvpcount", width: 15 },
      { header: "Kids RSVP", key: "kidsrsvpcount", width: 15 },
    ];

    responses.forEach(rsvp => {
      worksheet.addRow({
        memname: rsvp.memname,
        memphonenumber: rsvp.memphonenumber,
        rsvpcount: rsvp.rsvpcount,
        kidsrsvpcount: rsvp.kidsrsvpcount || 0,
      });
    });

    // Send Excel file
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

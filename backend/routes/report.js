const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");

const Programs = require("../models/Programs_DB_Schema");
const RsvpResponse = require("../models/Rsvp_Response_DB_Schema");

// In your report router file (e.g., report.js)
router.post("/rsvps/details", async (req, res) => {
  console.log("📋 RSVP member details request received");

  const { programname, eventname } = req.body;

  if (!programname || !eventname) {
    return res.status(400).json({ message: "Program and event are required." });
  }

  try {
    const details = await RsvpResponse.find({
      programname,
      eventname
    }).select("memname memphonenumber rsvpcount kidsrsvpcount");

    res.json(details);
  } catch (err) {
    console.error("❌ Error fetching RSVP member details:", err);
    res.status(500).json({ message: "Error fetching RSVP member details." });
  }
});


// 1️⃣ Get all programs (for dropdown)
router.get("/programs", async (req, res) => {
  try {
    const programs = await Programs.find({}, { progname: 1, _id: 0 }).sort({ progname: 1 });
    res.json(programs);
  } catch (err) {
    console.error("Error fetching programs:", err);
    res.status(500).json({ message: "Error fetching programs" });
  }
});

// 2️⃣ Get events for a given program (status Open or Closed)
router.get("/events/:programName", async (req, res) => {
  try {
    const { programName } = req.params;
    const events = await Programs.find(
      { progname: programName, eventstatus: { $in: ["Open", "Closed"] } },
      { events: 1, _id: 0 }
    );

    if (!events.length) return res.json([]);

    // Flatten events array if nested
    const flatEvents = events[0].events.filter(ev => ["Open", "Closed"].includes(ev.eventstatus));

    res.json(flatEvents);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Error fetching events" });
  }
});

// 3️⃣ Download RSVP report as Excel for selected program + event
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

    responses.forEach(rsvp => {
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

router.get("/rsvps/:programName/:eventName", async (req, res) => {
  try {
    const { programName, eventName } = req.params;

    const responses = await RsvpResponse.find({
      programname: programName,
      eventname: eventName,
    });

    if (!responses.length) {
      return res.json([]); // return empty array if none found
    }

    // Map to frontend-friendly shape
    const reportData = responses.map((rsvp) => ({
      memname: rsvp.memname,
      memphonenumber: rsvp.memphonenumber,
      rsvpcount: rsvp.rsvpcount,
      kidsrsvpcount: rsvp.kidsrsvpcount || 0,
    }));

    res.json(reportData);
  } catch (err) {
    console.error("Error fetching RSVP report:", err);
    res.status(500).json({ message: "Error fetching RSVP report" });
  }
});

module.exports = router;

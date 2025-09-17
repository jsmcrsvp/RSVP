// backend/routes/report.js
const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");

const RsvpResponse = require("../models/Rsvp_Response_DB_Schema");

// GET: Generate RSVP report for a given program + event
router.get("/:programName/:eventName", async (req, res) => {
  try {
    const { programName, eventName } = req.params;

    const responses = await RsvpResponse.find({
      programname: programName,
      eventname: eventName,
    });

    if (!responses.length) {
      return res.status(404).json({ message: "No RSVPs found for this event." });
    }

    // Create workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("RSVP Report");

    // Add headers
    worksheet.columns = [
      { header: "Member Name", key: "memname", width: 30 },
      { header: "Phone Number", key: "memphonenumber", width: 20 },
      { header: "Adult RSVP", key: "rsvpcount", width: 15 },
      { header: "Kids RSVP", key: "kidsrsvpcount", width: 15 },
    ];

    // Add rows
    responses.forEach((rsvp) => {
      worksheet.addRow({
        memname: rsvp.memname,
        memphonenumber: rsvp.memphonenumber,
        rsvpcount: rsvp.rsvpcount,
        kidsrsvpcount: rsvp.kidsrsvpcount || 0,
      });
    });

    // Set response headers for file download
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

// backend/routes/dashboard.js
const express = require("express");
const router = express.Router();
const RsvpResponse = require("../models/Rsvp_Response_DB_Schema"); // adjust path if needed

// GET: RSVP counts grouped by program + event + date + day
router.get("/stats", async (req, res) => {
  console.log ("Dashboard request received");
  try {
    const stats = await RsvpResponse.aggregate([
      {
        $group: {
          _id: {
            programname: "$programname",
            eventname: "$eventname",
            eventdate: "$eventdate",
            eventday: "$eventday",
          },
          totalRSVPs: { $sum: "$rsvpcount" },    // sum of numeric rsvpcount
          totalKidsRSVPs: {$sum: "$kidsrsvpcount"},
        },
      },
      { $sort: { "_id.programname": 1, "_id.eventdate": 1, "_id.eventname": 1 } },
    ]);

    // Map to simple shape for frontend
    const out = stats.map((s) => ({
      programname: s._id.programname,
      eventname: s._id.eventname,
      eventdate: s._id.eventdate,
      eventday: s._id.eventday,
      totalRSVPs: s.totalRSVPs,
      totalKidsRSVPs: s.totalKidsRSVPs
    }));

    res.json(out);
  } catch (err) {
    console.error("❌ Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
});

module.exports = router;

{/* backend/routes/dashboard.js ===== Working 091625 ==== 5:00pm ====
const express = require("express");
const router = express.Router();
const RsvpResponse = require("../models/Rsvp_Response_DB_Schema"); // adjust path if needed

// GET: RSVP counts grouped by program + event + date + day
router.get("/stats", async (req, res) => {
  try {
    const stats = await RsvpResponse.aggregate([
      {
        $group: {
          _id: {
            programname: "$programname",
            eventname: "$eventname",
            eventdate: "$eventdate",
            eventday: "$eventday",
          },
          totalRSVPs: { $sum: "$rsvpcount" },    // sum of numeric rsvpcount
        },
      },
      { $sort: { "_id.programname": 1, "_id.eventdate": 1, "_id.eventname": 1 } },
    ]);

    // Map to simple shape for frontend
    const out = stats.map((s) => ({
      programname: s._id.programname,
      eventname: s._id.eventname,
      eventdate: s._id.eventdate,
      eventday: s._id.eventday,
      totalRSVPs: s.totalRSVPs,
    }));

    res.json(out);
  } catch (err) {
    console.error("❌ Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
});

module.exports = router;
*/}
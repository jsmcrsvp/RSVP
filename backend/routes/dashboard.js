const express = require("express");
const router = express.Router();
const RsvpResponse = require("../models/Rsvp_Response_DB_Schema"); 
// adjust to your actual filename

// GET RSVP stats grouped by program + event + date
router.get("/stats", async (req, res) => {
  try {
    const events = await RsvpResponse.aggregate([
      {
        $group: {
          _id: {
            programname: "$programname",
            eventname: "$eventname",
            eventdate: "$eventdate",
            eventday: "$eventday",
          },
          totalRSVPs: { $sum: "$rsvpcount" },
          totalResponses: { $sum: 1 }, // number of submissions
        },
      },
      { $sort: { "_id.eventdate": 1 } }
    ]);

    res.json(
      events.map((e) => ({
        programname: e._id.programname,
        eventname: e._id.eventname,
        eventdate: e._id.eventdate,
        eventday: e._id.eventday,
        totalRSVPs: e.totalRSVPs,
        totalResponses: e.totalResponses,
      }))
    );
  } catch (err) {
    console.error("Error fetching RSVP stats:", err);
    res.status(500).send("Error fetching RSVP stats");
  }
});

module.exports = router;

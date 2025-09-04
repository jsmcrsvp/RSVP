const express = require("express");
const router = express.Router();
const RSVP = require("../models/Rsvp_Response_DB_Schema"); // new model for rsvp_response

router.post("/", async (req, res) => {
  try {
    const rsvp = new RSVP(req.body);
    await rsvp.save();
    res.json({ message: "RSVP submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit RSVP", error: err });
  }
});

module.exports = router;

// backend/routes/rsvp.js
const express = require("express");
const router = express.Router();
const RSVP = require("../models/Rsvp_Response_DB_Schema"); // new model for rsvp_response

// POST - save RSVP response
router.post("/", async (req, res) => {
  try {
    const newRSVP = new RsvpResponse(req.body);
    await newRSVP.save();
    res.status(201).json(newRSVP);
  } catch (err) {
    res.status(500).json({ message: "Error saving RSVP", error: err.message });
  }
});

module.exports = router;
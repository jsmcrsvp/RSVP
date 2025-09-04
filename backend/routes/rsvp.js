const express = require("express");
const Program = require("../models/Programs_DB_Schema");
const Member = require("../models/Members_DB_Schema");
const RsvpResponse = require("../models/RsvpResponse");

const router = express.Router();

// 📅 Get open events
router.get("/open-events", async (req, res) => {
  try {
    const openPrograms = await Program.find({ "progevent.eventstatus": "Open" });
    const events = [];

    openPrograms.forEach((prog) => {
      prog.progevent.forEach((event) => {
        if (event.eventstatus === "Open") {
          events.push({
            programname: prog.progname,
            eventname: event.eventname,
            eventdate: event.eventdate,
            eventday: event.eventday
          });
        }
      });
    });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Error fetching open events", error: err });
  }
});

// 🔍 Search member
router.post("/search", async (req, res) => {
  const { memberId, name, houseNumber } = req.body;

  try {
    let member;

    if (memberId) {
      member = await Member.findOne({ memberId });
    } else if (name && houseNumber) {
      member = await Member.findOne({
        fullName: { $regex: new RegExp(name, "i") },
        address: { $regex: new RegExp(houseNumber, "i") }
      });
    }

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({
      memname: member.fullName,
      memaddress: member.address,
      memphonenumber: member.phoneNumber
    });
  } catch (err) {
    res.status(500).json({ message: "Error searching member", error: err });
  }
});

// 📝 Submit RSVP
router.post("/submit", async (req, res) => {
  try {
    // Generate unique 6-digit confirmation number
    let confNumber;
    let exists = true;
    while (exists) {
      confNumber = Math.floor(100000 + Math.random() * 900000).toString();
      exists = await RsvpResponse.findOne({ rsvpconfnumber: confNumber });
    }

    const rsvp = new RsvpResponse({
      ...req.body,
      rsvpconfnumber: confNumber
    });

    await rsvp.save();
    res.json({ message: "RSVP submitted successfully", rsvp });
  } catch (err) {
    res.status(500).json({ message: "Error saving RSVP", error: err });
  }
});

module.exports = router;

// backend/routes/searchMember.js
const express = require("express");
const router = express.Router();
const Member = require("../models/Members_DB_Schema");

router.post("/", async (req, res) => {
  const { memberId, name, houseNumber } = req.body;
  console.log("searchMember.js: Member ", memberId, name, houseNumber);
  try {
    let member;

    if (memberId) {
      member = await Member.findOne({ memberId });
    } else if (name && houseNumber) {
      member = await Member.findOne({
        fullName: { $regex: new RegExp(name, "i") },
        address: { $regex: new RegExp(houseNumber, "i") },
      });
    } else {
      return res.status(400).json({ message: "Provide Member ID or Name + House Number" });
    }

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.json({
      memberId: member.memberId,
      name: member.fullName,
      address: member.address,
      phone: member.phoneNumber,
    });
  } catch (error) {
    console.error("❌ Internal server error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
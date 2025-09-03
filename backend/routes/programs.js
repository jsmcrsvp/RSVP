const express = require("express");
const Program = require("../models/Programs_DB_Schema");
const router = express.Router();

// Add a new program with its first event(s)
router.post("/", async (req, res) => {
  try {
    const { progname, progevent } = req.body;

    if (!progname || !progevent || !Array.isArray(progevent)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const program = new Program({ progname, progevent });
    await program.save();

    res.json({ message: "Program added successfully", program });
  } catch (err) {
    console.error("Error adding program:", err);
    res.status(500).json({ message: "Error adding program", error: err });
  }
});

module.exports = router;

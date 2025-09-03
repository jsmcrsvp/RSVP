// backend/routes/programs.js
const express = require("express");
const Program = require("../models/Programs_DB_Schema");
const router = express.Router();

// STEP 1: Add a new program with its first events
router.post("/", async (req, res) => {
  try {
    const { progname, progevent } = req.body;

    const program = new Program({ progname, progevent });
    await program.save();

    res.json(program);
  } catch (err) {
    res.status(500).json({ message: "Error adding program", error: err });
  }
});

module.exports = router;

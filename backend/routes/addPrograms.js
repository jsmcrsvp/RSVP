const express = require("express");
const router = express.Router();
const AddProgram = require("../models/addProgram_DB_Schema");

// GET all programs
router.get("/", async (req, res) => {
  try {
    const programs = await AddProgram.find().sort({ createdAt: -1 });
    res.json(programs);
  } catch (error) {
    console.error("❌ Error fetching programs:", error);
    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

// POST new program
router.post("/", async (req, res) => {
  try {
    const { program_name } = req.body;

    if (!program_name || !program_name.trim()) {
      return res.status(400).json({ error: "Program name is required" });
    }

    // check for duplicates
    const exists = await AddProgram.findOne({ program_name: program_name.trim() });
    if (exists) return res.status(400).json({ error: "Program already exists" });

    const newProgram = new AddProgram({ program_name: program_name.trim() });
    const saved = await newProgram.save();

    res.status(201).json({ message: "Program saved successfully", program: saved });
  } catch (error) {
    console.error("❌ Error saving program:", error);
    res.status(500).json({ error: "Failed to save program" });
  }
});

module.exports = router;

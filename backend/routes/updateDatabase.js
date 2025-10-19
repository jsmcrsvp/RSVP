const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const Member = require("../models/Members_DB_Schema");

const upload = multer({ storage: multer.memoryStorage() });

// Existing upload route
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty." });
    }

    await Member.deleteMany({});
    await Member.insertMany(data);

    return res.json({ message: `✅ ${data.length} members imported successfully.` });
  } catch (error) {
    console.error("Error importing members:", error);
    return res.status(500).json({ message: "Error importing members." });
  }
});

// NEW: Delete all members
router.delete("/delete-all", async (req, res) => {
  try {
    const result = await Member.deleteMany({});
    return res.json({
      message: `🗑️ All members deleted successfully (${result.deletedCount} records removed).`,
    });
  } catch (error) {
    console.error("Error deleting members:", error);
    return res.status(500).json({ message: "Failed to delete all members." });
  }
});

module.exports = router;


/* backend/routes/updateDatabase.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const Member = require("../models/Members_DB_Schema");

// Configure Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST route to upload Excel file and update database
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("✅ Received file:", req.file.originalname);

    // Read Excel file from buffer
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty or invalid" });
    }

    // Map Excel data to your schema
    const members = data.map((row) => ({
      memberId: row["Member ID"],
      fullName: row["Full Name"],
      address: row["Address"],
      phoneNumber: row["Phone Number"],
      email: row["Email"],
    }));

    // Optional: clear existing records before inserting new ones
    await Member.deleteMany({});
    const inserted = await Member.insertMany(members);

    console.log(`✅ ${inserted.length} members imported successfully.`);
    return res.status(200).json({
      success: true,
      message: `✅ ${inserted.length} members imported successfully.`,
    });
  } catch (err) {
    console.error("❌ Error importing members:", err.message);
    return res.status(500).json({ message: "Server error importing members" });
  }
});

module.exports = router;
*/
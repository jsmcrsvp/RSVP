// backend/routes/updateDatabase.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const Member = require("../models/Members_DB_Schema"); // ✅ reuse existing schema model

// Configure multer to store uploaded Excel files temporarily
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
      return cb(new Error("Only Excel files (.xlsx/.xls) are allowed."));
    }
    cb(null, true);
  },
});

// POST /api/updatedatabase
router.post("/", upload.single("excelFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }

  console.log(`📂 Received file: ${req.file.originalname}`);

  try {
    // Read and parse Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!data || data.length === 0) {
      return res.status(400).json({ success: false, message: "Excel file is empty or invalid." });
    }

    // Map Excel rows to schema fields
    const members = data.map((row) => ({
      memberId: row["Member ID"],
      fullName: row["Full Name"],
      address: row["Address"],
      phoneNumber: row["Phone Number"],
      email: row["Email"],
    }));

    // Optional: clear existing collection before reimporting
    // await Member.deleteMany({});
    console.log(`📋 ${members.length} records found in Excel.`);

    // Bulk insert
    const result = await Member.insertMany(members);
    console.log(`✅ Successfully imported ${result.length} members.`);

    res.status(200).json({
      success: true,
      message: `${result.length} members imported successfully.`,
    });
  } catch (error) {
    console.error("❌ Error processing Excel upload:", error);
    res.status(500).json({ success: false, message: "Server error during import." });
  } finally {
    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.warn("⚠️ Could not delete uploaded file:", err.message);
    });
  }
});

module.exports = router;

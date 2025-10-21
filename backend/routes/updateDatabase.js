// backend/routes/updateDatabase.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const Member = require("../models/Members_DB_Schema");

// Multer config - store uploads in a temp folder
const upload = multer({
  dest: path.join(__dirname, "..", "uploads"), // backend/uploads
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// DELETE all members
router.delete("/delete-all", async (req, res) => {
  try {
    const result = await Member.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} member records.`);
    return res.json({ message: `Deleted ${result.deletedCount} member records.`, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("❌ Error deleting members:", err);
    return res.status(500).json({ message: "Failed to delete members." });
  }
});

// POST upload & import Excel
// Expects multipart/form-data with field name "file"
router.post("/", upload.single("file"), async (req, res) => {
  const uploadedPath = req.file?.path;
  const originalName = req.file?.originalname || "unknown";
  if (!uploadedPath) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    console.log(`📂 Received file: ${originalName} -> ${uploadedPath}`);

    // Read workbook
    const workbook = xlsx.readFile(uploadedPath);
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Map rows to your Member schema fields (keep names exactly as you used)
    const members = rows.map((row) => ({
      memberId: row["Member ID"] ?? row.memberId ?? row.MemberID ?? "",
      fullName: row["Full Name"] ?? row.fullName ?? row.Name ?? "",
      address: row["Address"] ?? row.address ?? "",
      phoneNumber: row["Phone Number"] ?? row.phoneNumber ?? row.Phone ?? "",
      email: row["Email"] ?? row.email ?? "",
    }));

    if (!Array.isArray(members) || members.length === 0) {
      console.log("⚠️ No rows found in uploaded Excel file.");
      return res.status(400).json({ message: "No records found in Excel file." });
    }

    // InsertMany
    const inserted = await Member.insertMany(members);
    console.log(`✅ Imported ${inserted.length} member records from ${originalName}.`);

    return res.json({ message: `Imported ${inserted.length} member records.` });
  } catch (err) {
    console.error("❌ Error importing members:", err);
    return res.status(500).json({ message: "Error importing members." });
  } finally {
    // Remove temp upload file to avoid disk growth
    try {
      if (uploadedPath && fs.existsSync(uploadedPath)) {
        fs.unlinkSync(uploadedPath);
        console.log(`🧹 Removed temp file: ${uploadedPath}`);
      }
    } catch (unlinkErr) {
      console.warn("⚠️ Failed to remove temp file:", unlinkErr);
    }
  }
});

module.exports = router;
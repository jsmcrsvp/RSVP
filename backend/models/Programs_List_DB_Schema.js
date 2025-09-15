// backend/models/Programs_List_DB_Schema.js
const mongoose = require("mongoose");

const programsListSchema = new mongoose.Schema(
  {
    program_name: { type: String, required: true },
  },
  { timestamps: true } // ✅ adds createdAt / updatedAt automatically
);

// ✅ Third arg fixes the collection name in MongoDB
const ProgramsList = mongoose.model("ProgramsList", programsListSchema, "programs_list");

module.exports = ProgramsList;

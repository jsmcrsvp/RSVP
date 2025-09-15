const mongoose = require("mongoose");

const programsListSchema = new mongoose.Schema(
  {
    program_name: { type: String, required: true },
  },
  { timestamps: true } // ✅ adds createdAt / updatedAt automatically
);

// ✅ Third argument fixes the MongoDB collection name
const ProgramsList = mongoose.model("ProgramsList", programsListSchema, "programs_list");

module.exports = ProgramsList;

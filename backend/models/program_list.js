const mongoose = require("mongoose");

const programsListSchema = new mongoose.Schema(
  { program_name: { type: String, required: true } },
  { timestamps: true }
);

const ProgramList = mongoose.models.ProgramList || mongoose.model("ProgramList", programsListSchema, "programs_list");

module.exports = ProgramList;

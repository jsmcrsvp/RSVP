const mongoose = require("mongoose");

const programsListSchema = new mongoose.Schema(
  {
    program_name: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ model name, schema, and Mongo collection name
const Program = mongoose.model("Program", programsListSchema, "programs_list");

module.exports = Program;

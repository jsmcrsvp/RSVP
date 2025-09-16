const mongoose = require("mongoose");

const addProgramSchema = new mongoose.Schema(
  {
    program_name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

// Avoid OverwriteModelError
const AddProgram =
  mongoose.models.AddProgram || mongoose.model("AddProgram", addProgramSchema, "programs_list");

module.exports = AddProgram;

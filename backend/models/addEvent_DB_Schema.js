const mongoose = require("mongoose");

const addEventSchema = new mongoose.Schema(
  {
    event_name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

// Avoid OverwriteModelError
const AddEvent =
  mongoose.models.AddEvent || mongoose.model("AddEvent", addEventSchema, "events_list");

module.exports = AddEvent;

const mongoose = require("mongoose");

const eventsListSchema = new mongoose.Schema(
  {
    event_name: { type: String, required: true },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventsListSchema, "events_list");

module.exports = Event;

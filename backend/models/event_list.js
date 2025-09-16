const mongoose = require("mongoose");

const eventsListSchema = new mongoose.Schema(
  { event_name: { type: String, required: true } },
  { timestamps: true }
);

const EventList = mongoose.models.EventList || mongoose.model("EventList", eventsListSchema, "events_list");

module.exports = EventList;

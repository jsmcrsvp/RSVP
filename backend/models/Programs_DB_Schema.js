// backend/models/Program.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  eventname: { type: String, required: true },
  eventdate: { type: String, required: true },
  eventday: { type: String, required: true },
  eventstatus: { type: String, enum: ["Open", "Closed", "Completed"], required: true },
});

const programSchema = new mongoose.Schema({
  progname: { type: String, required: true },
  progevent: { type: [eventSchema], default: [] },
});

const Program = mongoose.model("Program", programSchema, "programs");
module.exports = Program;

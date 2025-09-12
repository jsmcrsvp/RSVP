const mongoose = require('mongoose');

// Define an Event schema
const eventSchema = new mongoose.Schema({
  eventname: { type: String, required: true },
  eventdate: { type: String, required: true },
  eventday: { type: String, required: true },
  eventstatus: { type: String, required: true, enum: ["Open", "Closed", "Completed"] },
  closersvp: { type: String, required: true }
});

// Define Program schema
const programSchema = new mongoose.Schema({
  progname: { type: String, required: true },
  progevent: { type: [eventSchema], default: [] }
});

const Program = mongoose.model('Program', programSchema, 'programs');

module.exports = Program;

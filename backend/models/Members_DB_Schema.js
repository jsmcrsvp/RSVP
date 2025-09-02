const mongoose = require('mongoose');

// Create a schema for the Members
const memberSchema = new mongoose.Schema({
//  _id: mongoose.Schema.Types.ObjectId,  // Custom ObjectId (optional)
  memberId: { type: String, required: true },
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: Number, default: 0 }
});

// Create a model for the Member using the schema
const Member = mongoose.model('Member', memberSchema, 'members');

module.exports = Member;

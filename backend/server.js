require('dotenv').config();
const axios = require("axios");
const express = require('express');
const cors = require('cors');
const app = express();
//const jwt = require('jsonwebtoken');
//const bcrypt = require('bcryptjs');
const { Console } = require('console');

//=====================================================================================================
const corsOptions = {
  origin: [
    'https://jsmcrsvp.onrender.com',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

//=====================================================================================================
const MONGODB_URI = process.env.MONGO_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const Member = require('./models/Members_DB_Schema');
//const GameDetails = require('./models/GameDetails');
//const EventLog = require('./models/EventLog');
const mongoose = require('mongoose');

mongoose.connection.on("disconnected", async () => {
  console.log("🔄 MongoDB disconnected! Attempting to reconnect...");
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB reconnected!");
  } catch (error) {
    console.error("❌ MongoDB reconnection failed:", error);
  }
});

//==================Changes for Render hosting ============
const port = process.env.PORT || 5001;

/*=====================================================================================================
async function logEvent(action, details = '') {
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
  const logMessage = `[${timestamp}] ${action} - ${details}`;
  await EventLog.create({ logEntry: logMessage });
}*/

//=====================================================================================================
app.post("/search_member", async (req, res) => {
  const { member_id } = req.body;
  console.log("server.js/search_member: Member ID ", member_id);

  try {
    const member = await Member.findOne({ member_id });

    if (!member) {
      return res.status(401).json({ message: "Invalid Member ID..." });
    }

    let isMatch = "";

    console.log(`Member Found! ${member.fullName}`);
    //await logEvent('Player Access', `Login Successful! ${player.name}`);

    return res.json({
      message: "server.js/search_member: Member Search successful",
      name: member.fullName,
      address: member.address,
      phone: member.phoneNumber,
    });

  } catch (error) {
    console.error("server.js/search_member: Internal server error", error);
    return res.status(500).json({ message: "server.js/search_member: Internal server error" });
  }
});
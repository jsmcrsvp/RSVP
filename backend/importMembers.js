require("dotenv").config();  // Load variables from .env

const xlsx = require("xlsx");
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGO_URI; // comes from .env

// Check if URI is loaded
if (!MONGODB_URI) {
  console.error("❌ MONGO_URI is not defined. Did you set it in .env?");
  process.exit(1);
}

const memberSchema = new mongoose.Schema({
  memberId: String,
  fullName: String,
  address: String,
  phoneNumber: String,
  email: String
});

const Member = mongoose.model("Member", memberSchema);

async function importExcelToMongo() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "JSMC_Members" // Specify DB Name
    });
    console.log("✅ Connected to MongoDB");

    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("✅ Ping successful — connection verified");

    const workbook = xlsx.readFile("jsmc-opa RSVP 8.19.2025.xlsx");
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const members = data.map(row => ({
      memberId: row["Member ID"],
      fullName: row["Full Name"],
      address: row["Address"],
      phoneNumber: row["Phone Number"],
      email: row["Email"]
    }));

    if (members.length > 0) {
      const result = await Member.insertMany(members);
      console.log(`✅ ${result.length} members imported successfully.`);
    } else {
      console.log("⚠️ No data found in Excel file.");
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔒 MongoDB connection closed.");
  }
}

importExcelToMongo();

mongodb+srv://jsmcrsvp_user:Jsmc1008@cluster0.taxyjsn.mongodb.net/JSMC_Members?retryWrites=true&w=majority
mongodb+srv://jsgvolleyball25:Sports%401271@cluster0.hste0.mongodb.net/JSG-Volleyball?retryWrites=true&w=majority
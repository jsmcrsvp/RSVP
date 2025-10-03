// backend/routes/rsvp.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const RsvpResponse = require("../models/Rsvp_Response_DB_Schema");
const Program = require("../models/Programs_DB_Schema"); // 👈 import Program schema

// POST RSVP (works for both members and non-members)
router.post("/", async (req, res) => {
    try {
        const {
            memname,
            memaddress,
            memphonenumber,
            mememail,
            rsvpconfnumber,
            events,
            isNonMember // 👈 NEW flag to differentiate
        } = req.body;

        if (!memname || !mememail || !Array.isArray(events) || events.length === 0) {
            return res.status(400).json({ message: "Missing required RSVP data." });
        }

        // Save RSVP entries (same schema for members & non-members)
        const savedResponses = await Promise.all(
            events.map(async (ev) => {
                const newRSVP = new RsvpResponse({
                    memname,
                    memaddress: memaddress || (isNonMember ? "Non-member" : ""), // fallback
                    memphonenumber: memphonenumber || (isNonMember ? "N/A" : ""),
                    mememail,
                    rsvpcount: ev.rsvpcount,        // adult RSVP
                    kidsrsvpcount: ev.kidsrsvpcount || 0, // 👈 add this line
                    rsvpconfnumber,
                    eventname: ev.eventname,
                    programname: ev.programname,
                    eventdate: ev.eventdate,
                    eventday: ev.eventday,
                    isNonMember: isNonMember || false // 👈 mark explicitly
                });
                return await newRSVP.save();
            })
        );
        
        // Build email content
        let eventDetails = events
            .map(
                (ev) =>
                    `• ${ev.programname} - ${ev.eventname} on ${ev.eventday}, ${ev.eventdate} (Adult: ${ev.rsvpcount}, Kids: ${ev.kidsrsvpcount || 0})`
            )
            .join("\n");


        const emailBody = `
        Dear ${memname},

        Your RSVP has been successfully submitted.  
        Confirmation Number: ${rsvpconfnumber}

        Here are the event(s) you RSVP’d for:
        ${eventDetails}

        Thank you,
        JSMC RSVP Team
        `;

        // Setup nodemailer
        const transporter = nodemailer.createTransport({
            host: "smtp.ionos.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
        });

        await transporter.sendMail({
            from: `"JSMC RSVP" <admin@jsgvolleyball.com>`,
            to: mememail,
            subject: `RSVP Confirmation - #${rsvpconfnumber}`,
            text: emailBody,
        });
        
        res.status(201).json({ message: "RSVP submitted and email sent!" });
        //res.status(201).json({ message: "RSVP submitted!" });
    } catch (err) {
        console.error("Error submitting RSVP:", err);
        res.status(500).json({ message: "Error submitting RSVP" });
    }
});

// GET RSVP by Name + House #
router.get("/search", async (req, res) => {
    const { name, houseNumber } = req.query;
    if (!name || !houseNumber) {
        return res.status(400).json({ message: "Name and House # required." });
    }

    try {
        const rsvps = await RsvpResponse.find({
            memname: { $regex: new RegExp(name, "i") },
            memaddress: { $regex: new RegExp(houseNumber, "i") },
        });

        console.log("rsvp.js/search: Member ", name, houseNumber);

        if (!rsvps || rsvps.length === 0) {
            return res.status(404).json({ rsvps: [] });
        }

        // Enrich with event status from Program collection
        const enrichedRsvps = await Promise.all(
            rsvps.map(async (rsvp) => {
                const program = await Program.findOne({ progname: rsvp.programname }, { progevent: 1 });
                let status = "Unknown";
                if (program) {
                    const ev = program.progevent.find(
                        (e) =>
                            e.eventname === rsvp.eventname &&
                            e.eventdate === rsvp.eventdate &&
                            e.eventday === rsvp.eventday
                    );
                    if (ev) status = ev.eventstatus;
                }
                return { ...rsvp.toObject(), eventstatus: status };
            })
        );

        res.json({ rsvps: enrichedRsvps });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching RSVP by Name + House" });
    }
});

// GET RSVP by confirmation number
router.get("/:confNumber", async (req, res) => {
    try {
        const { confNumber } = req.params;

        // Find RSVP entries
        const rsvps = await RsvpResponse.find({ rsvpconfnumber: confNumber });

        if (!rsvps || rsvps.length === 0) {
            return res.status(404).json({ error: "RSVP not found" });
        }

        // Enrich with eventstatus from Program collection
        const enrichedRsvps = await Promise.all(
            rsvps.map(async (rsvp) => {
                const program = await Program.findOne(
                    { progname: rsvp.programname },
                    { progevent: 1 }
                );

                let status = "Unknown";
                if (program) {
                    const ev = program.progevent.find(
                        (e) =>
                            e.eventname === rsvp.eventname &&
                            e.eventdate === rsvp.eventdate &&
                            e.eventday === rsvp.eventday
                    );
                    if (ev) status = ev.eventstatus;
                }

                return {
                    ...rsvp.toObject(),
                    eventstatus: status,
                };
            })
        );

        res.json({ rsvps: enrichedRsvps });
    } catch (err) {
        console.error("Error fetching RSVP:", err);
        res.status(500).json({ error: "Server error fetching RSVP" });
    }
});

// ✨ Update RSVP (Adults + Kids)
router.put("/update_rsvp/:id", async (req, res) => {
    const { id } = req.params;
    const { rsvpcount, kidsrsvpcount } = req.body;

    console.log("🔧 Received update request for RSVP ID:", id);
    console.log("👨 Adults (rsvpcount):", rsvpcount, "👶 Kids (kidsrsvpcount):", kidsrsvpcount);

    const adultNum = Number(rsvpcount);
    const kidsNum = Number(kidsrsvpcount);

    if (!Number.isFinite(adultNum) || !Number.isFinite(kidsNum)) {
        return res
            .status(400)
            .json({ message: "Invalid RSVP counts. Both adult and kids counts must be numbers." });
    }

    try {
        const updated = await RsvpResponse.findByIdAndUpdate(
            id,
            {
                rsvpcount: Math.max(0, parseInt(adultNum, 10)),
                kidsrsvpcount: Math.max(0, parseInt(kidsNum, 10)),
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "RSVP record not found." });
        }

        console.log("✅ Updated RSVP:", updated);
        {/*
        // ✉️ Send confirmation email
        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.ionos.com",
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const total = (updated.rsvpcount || 0) + (updated.kidsrsvpcount || 0);

            const mailOptions = {
                from: `"JSMC RSVP" <${process.env.EMAIL_FROM || "admin@jsgvolleyball.com"}>`,
                to: updated.mememail,
                subject: "Your RSVP Has Been Updated",
                html: `
          <h2>RSVP Update Confirmation</h2>
          <p>Dear ${updated.memname || "Guest"},</p>
          <p>Your RSVP has been updated for the following event:</p>
          <ul>
            <li><b>Program:</b> ${updated.programname || ""}</li>
            <li><b>Event:</b> ${updated.eventname || ""}</li>
            <li><b>Date:</b> ${updated.eventdate || ""} (${updated.eventday || ""})</li>
            <li><b>Adults:</b> ${updated.rsvpcount}</li>
            <li><b>Kids:</b> ${updated.kidsrsvpcount}</li>
            <li><b>Total:</b> ${total}</li>
            <li><b>Confirmation #:</b> ${updated.rsvpconfnumber || ""}</li>
          </ul>
          <p>If you did not make this change, please contact us immediately.</p>
        `,
            };

            await transporter.sendMail(mailOptions);
            console.log("📧 RSVP update email sent to:", updated.mememail);
        } catch (emailErr) {
            console.error("❌ Error sending RSVP update email:", emailErr);
        }
*/}
        res.json({ message: "RSVP updated successfully.", updated });
    } catch (err) {
        console.error("❌ Error updating RSVP:", err);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;


{/*
router.put("/update_rsvp/:id", async (req, res) => {
    const { id } = req.params;
    const { rsvpcount } = req.body;

    console.log("🔧 Received update request for RSVP ID:", id);
    console.log("🔢 New RSVP count:", rsvpcount);

    if (rsvpcount === undefined || isNaN(rsvpcount)) {
        return res.status(400).json({ message: "Invalid RSVP count." });
    }

    try {
        console.log("Updating RSVP ID:", id, "with count:", rsvpcount);
        const updated = await RsvpResponse.findByIdAndUpdate(
            id,
            { rsvpcount: parseInt(rsvpcount, 10) },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "RSVP record not found." });
        }

        console.log("Updated RSVP:", updated);

        // 🔔 Send confirmation email
        try {
            // ✅ Setup nodemailer transporter (update with your SMTP creds)
            const transporter = nodemailer.createTransport({
                host: "smtp.ionos.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
            });

            const mailOptions = {
                from: `"JSMC RSVP" <admin@jsgvolleyball.com>`,
                to: updated.mememail, // assumes email is in DB (if not, we’ll need to include in payload)
                subject: "Your RSVP Has Been Updated",
                html: `
                  <h2>RSVP Update Confirmation</h2>
                  <p>Dear ${updated.memname},</p>
                  <p>Your RSVP has been updated for the following event:</p>
                  <ul>
                    <li><b>Program:</b> ${updated.programname}</li>
                    <li><b>Event:</b> ${updated.eventname}</li>
                    <li><b>Date:</b> ${updated.eventdate} (${updated.eventday})</li>
                    <li><b>Updated RSVP Count:</b> ${updated.rsvpcount}</li>
                    <li><b>Confirmation #:</b> ${updated.rsvpconfnumber}</li>
                  </ul>
                  <p>If you did not make this change, please contact us immediately.</p>
                `,
            };

            await transporter.sendMail(mailOptions);
            console.log("✅ RSVP update email sent to:", updated.email);
        } catch (emailErr) {
            console.error("❌ Error sending RSVP update email:", emailErr);
        }

        res.json({ message: "RSVP updated successfully.", updated });
    } catch (err) {
        console.error("Error updating RSVP:", err);
        res.status(500).json({ message: "Server error." });
    }
});
*/}

// GET: Retrieve RSVP(s) by confirmation number

/*router.get("/:confNumber", async (req, res) => {
    try {
        let { confNumber } = req.params;
        console.log(`backend/routes/rsvp.js 🔎 Looking up RSVP for confirmation number: ${confNumber}`);
        console.log("backend/routes/rsvp.js 📌 Type of confNumber param:", typeof confNumber);

        if (!confNumber) {
            return res.status(400).json({ message: "Confirmation number required" });
        }

        // ✅ Force to string for consistent lookup
        confNumber = String(confNumber);

        const rsvps = await RsvpResponse.find({ rsvpconfnumber: confNumber });

        if (!rsvps || rsvps.length === 0) {
            console.warn(`⚠️ No RSVP found for confirmation number: ${confNumber}`);
            return res.status(404).json({ message: "No RSVP found for this confirmation number" });
        }

        console.log(`backend/routes/rsvp.js ✅ Found ${rsvps.length} RSVP(s) for confirmation number: ${confNumber}`);

        res.status(200).json({
            message: "RSVP(s) retrieved successfully",
            rsvps,
        });
    } catch (err) {
        console.error("❌ Error retrieving RSVP:", err);
        res.status(500).json({ message: "Error retrieving RSVP", error: err.message });
    }
});
*/
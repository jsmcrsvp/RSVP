import React, { useState, useEffect } from "react";
import api, { searchMember } from "../api";
import "../styles/SubmitRSVP.css";

function SubmitRSVP() {
  const [openEvents, setOpenEvents] = useState([]);
  const [selectedEventIndex, setSelectedEventIndex] = useState("");
  const [searchMode, setSearchMode] = useState("memberId");
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [member, setMember] = useState(null);
  const [rsvpCount, setRsvpCount] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [message, setMessage] = useState("");

  // Fetch open events
  useEffect(() => {
    const fetchOpenEvents = async () => {
      try {
        const res = await api.get("/api/programs/open-events");
        setOpenEvents(res.data);
      } catch (err) {
        console.error("❌ Error fetching open events:", err);
      }
    };
    fetchOpenEvents();
  }, []);

  // Generate 6-digit confirmation number
  const generateConfirmationNumber = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Search member
  const handleSearch = async () => {
    setMessage("");
    setMember(null);
    try {
      let payload = {};
      if (searchMode === "memberId") {
        payload = { memberId };
      } else {
        payload = { name, houseNumber };
      }
      const res = await searchMember(payload);
      setMember(res);
    } catch (err) {
      setMessage("❌ Member not found");
    }
  };

  // Submit RSVP
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!member || !selectedEventIndex || !rsvpCount) {
      setMessage("❌ Please complete all fields");
      return;
    }

    const event = openEvents[selectedEventIndex];
    const confNum = generateConfirmationNumber();

    const payload = {
      eventdate: event.eventdate,
      eventday: event.eventday,
      eventname: event.eventname,
      programname: event.programname,
      memname: member.name,
      memaddress: member.address,
      memphonenumber: member.phone,
      rsvpcount: rsvpCount,
      rsvpconfnumber: confNum,
    };

    try {
      await api.post("/api/rsvp", payload);
      setConfirmationNumber(confNum);
      setMessage("✅ RSVP submitted successfully!");
      setRsvpCount("");
    } catch (err) {
      setMessage("❌ Failed to submit RSVP");
    }
  };

  return (
    <div className="rsvp-container">
      <h2>Submit RSVP</h2>

      {/* Event selection */}
      <label>Select Open Event:</label>
      <select
        value={selectedEventIndex}
        onChange={(e) => setSelectedEventIndex(e.target.value)}
      >
        <option value="">-- Select Event --</option>
        {openEvents.map((ev, idx) => (
          <option key={idx} value={idx}>
            {ev.programname} - {ev.eventname} ({ev.eventdate})
          </option>
        ))}
      </select>

      {/* Member Search */}
      <div className="search-section">
        <div>
          <input
            type="radio"
            id="searchById"
            name="searchMode"
            value="memberId"
            checked={searchMode === "memberId"}
            onChange={() => setSearchMode("memberId")}
          />
          <label htmlFor="searchById">Member ID</label>
          {searchMode === "memberId" && (
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
          )}
        </div>

        <div>
          <input
            type="radio"
            id="searchByName"
            name="searchMode"
            value="name"
            checked={searchMode === "name"}
            onChange={() => setSearchMode("name")}
          />
          <label htmlFor="searchByName">Name + House #</label>
          {searchMode === "name" && (
            <>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
              />
              <span>House #</span>
              <input
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="House #"
              />
            </>
          )}
        </div>

        <button type="button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Show member info */}
      {member && (
        <div className="member-info">
          <p>
            <strong>Name:</strong> {member.name}
          </p>
          <p>
            <strong>Address:</strong> {member.address}
          </p>
          <p>
            <strong>Phone:</strong> {member.phone}
          </p>

          <input
            type="number"
            value={rsvpCount}
            onChange={(e) => setRsvpCount(e.target.value)}
            placeholder="RSVP Count"
            min="1"
          />
          <button onClick={handleSubmit}>Submit RSVP</button>
        </div>
      )}

      {/* Confirmation */}
      {confirmationNumber && (
        <p className="confirmation">
          ✅ Your confirmation number: <strong>{confirmationNumber}</strong>
        </p>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default SubmitRSVP;

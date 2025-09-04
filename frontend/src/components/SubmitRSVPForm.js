import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/SubmitRSVPForm.css";

const SERVER_URL = process.env.REACT_APP_BACKEND_SERVER_URL || "http://localhost:3001";

function SubmitRSVPForm() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchInput, setSearchInput] = useState({ memberId: "", name: "", houseNumber: "" });
  const [member, setMember] = useState(null);
  const [rsvpCount, setRsvpCount] = useState(1);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // Load open events from backend
  useEffect(() => {
    axios
      .get(`${SERVER_URL}/api/rsvp/open-events`)
      .then((res) => setEvents(res.data))
      .catch(() => setEvents([]));
  }, []);

  const handleSearch = async () => {
    try {
      const res = await axios.post(`${SERVER_URL}/api/rsvp/search`, searchInput);
      setMember(res.data);
      setMessage("");
    } catch (err) {
      setMember(null);
      setMessage("❌ Member not found");
    }
  };

  const handleSubmit = async () => {
    if (!selectedEvent || !member) {
      setMessage("❌ Please select an event and search a member first.");
      return;
    }

    const payload = {
      ...selectedEvent,
      ...member,
      rsvpcount: rsvpCount,
    };

    try {
      const res = await axios.post(`${SERVER_URL}/api/rsvp/submit`, payload);
      const conf = res.data.rsvp.rsvpconfnumber;
      setConfirmation(conf);
      setMessage(`✅ RSVP submitted successfully!`);
    } catch (err) {
      setConfirmation(null);
      setMessage("❌ Failed to submit RSVP");
    }
  };

  return (
    <div className="rsvp-wrapper">
    <div className="rsvp-form">
      <h2>Submit RSVP</h2>

      {/* Step 1: Select Event */}
      <div className="form-section">
        <label>Select Open Event:</label>
        <select
          onChange={(e) => {
            const ev = events.find((ev) => ev.eventname === e.target.value);
            setSelectedEvent(ev);
            setConfirmation(null);
            setMember(null);
            setMessage("");
          }}
        >
          <option value="">-- Select Event --</option>
          {events.map((ev, i) => (
            <option key={i} value={ev.eventname}>
              {ev.programname} - {ev.eventname} ({ev.eventdate}, {ev.eventday})
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Search Member */}
      {selectedEvent && (
        <div className="form-section">
          <h3>Search Member</h3>
          <input
            placeholder="Member ID"
            value={searchInput.memberId}
            onChange={(e) => setSearchInput({ ...searchInput, memberId: e.target.value })}
          />
          <input
            placeholder="Name"
            value={searchInput.name}
            onChange={(e) => setSearchInput({ ...searchInput, name: e.target.value })}
          />
          <input
            placeholder="House #"
            value={searchInput.houseNumber}
            onChange={(e) => setSearchInput({ ...searchInput, houseNumber: e.target.value })}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      )}

      {/* Step 3: RSVP Count */}
      {member && (
        <div className="form-section">
          <h3>RSVP</h3>
          <p>
            Member: <b>{member.memname}</b> ({member.memaddress})
          </p>
          <input
            type="number"
            min="1"
            value={rsvpCount}
            onChange={(e) => setRsvpCount(Number(e.target.value))}
          />
          <button onClick={handleSubmit}>Submit RSVP</button>
        </div>
      )}

      {/* Step 4: Confirmation Number */}
      {confirmation && (
        <div className="confirmation-box">
          <h3>🎟 RSVP Confirmation</h3>
          <p>Thank you for your RSVP!</p>
          <p>
            <b>Confirmation Number:</b> {confirmation}
          </p>
          <p>
            <b>Event:</b> {selectedEvent?.programname} - {selectedEvent?.eventname}
          </p>
          <p>
            <b>Date:</b> {selectedEvent?.eventdate} ({selectedEvent?.eventday})
          </p>
          <p>
            <b>RSVP Count:</b> {rsvpCount}
          </p>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
    </div>
  );
}

export default SubmitRSVPForm;
